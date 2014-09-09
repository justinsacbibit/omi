var Promise          = require('bluebird')
  , _                = require('underscore')
  , TransactionModel = require('../models/money/transaction.js').TransactionModel
  , GroupOmiModel    = require('../models/money/groupOmi.js').GroupOmiModel
  , OmiRequestModel  = require('../models/requests/omiRequest.js').OmiRequestModel
  , OwerModel        = require('../models/people/ower.js').OwerModel
  , UserModel        = require('../models/people/user.js').UserModel
  , error            = require('../utils/error.js')
  , paginate         = require('../utils/paginate.js');

var ClientErrors    = require('../models/errors/client.js')
  , ExistsError     = ClientErrors.ExistsError
  , NotFoundError   = ClientErrors.NotFoundError
  , ForbiddenError  = ClientErrors.ForbiddenError
  , BadRequestError = ClientErrors.BadRequestError;

var ServerErrors = require('../models/errors/server.js')
  , ServerError  = ServerErrors.ServerError;

var changeBalance = function(ower, owerIsReceiving, type, amount) {
  if ((owerIsReceiving && type === 'omi') || (!owerIsReceiving && type === 'payment')) {
    ower.balance += parseFloat(amount);
  } else {
    ower.balance -= parseFloat(amount);
  }
  return ower;
};

var orConditions = function(user, facebookId, conditions) {
  var orConditions = [
    {
      from: user._id
    },
    {
      to: user._id
    }
  ];

  var findOwerConditions = {
    type: 'ower'
  };

  if (facebookId) {
    findOwerConditions.facebookId = facebookId;
  }

  return OwerModel.findAsync(findOwerConditions)
  .then(function(owers) {
    for (var i = 0; i < owers.length; i++) {
      var ower = owers[i];

      orConditions.push({
        from: ower._id
      });

      orConditions.push({
        to: ower._id
      });
    }

    conditions.$or = orConditions;
    return conditions;
  });
};

exports.all = function(req, res) {
  var facebookId = req.param('facebook_id')
    , user       = req.user
    , owerId     = req.query.ower_id
    , offset     = req.query.offset
    , limit      = req.query.limit
    , type       = req.query.type;

  var conditions = {};

  if (!paginate(req, res, conditions)) {
    return;
  }

  if (type && type !== 'omi' && type !== 'user') {
    return error.badRequest(res, 'Type must be either "omi" or "user"');
  } else if (type) {
    conditions.type = type;
  }

  var promise = Promise.delay(0); // used for admin access since admin doesn't have a user obj

  if (owerId && user) {
    conditions.$or = [
      {
        from: user._id,
        to:   owerId
      },
      {
        from: owerId,
        to:   user._id
      }
    ];
  } else if (user) {
    promise = orConditions(user, facebookId, conditions);
  }

  promise.then(function() {
    return TransactionModel.findAsync(conditions, null, {
      sort: {
        created: 'descending'
      }
    });
  })
  .then(function(transactions) {
    res.json(transactions);
  })
  .catch(error.serverHandler(res));
};

exports.create = function(req, res) {
  var facebookId = req.param('facebook_id')
    , user       = req.user
    , name       = req.body.name
    , amount     = req.body.amount
    , note       = req.body.note
    , from       = req.body.from
    , to         = req.body.to
    , type       = req.body.type
    , omis       = req.body.omis
    , array      = []
    , promises   = []
    , objects    = []
    , groupOmi;

  var omiObj = {
    name:   name,
    amount: amount,
    note:   note,
    from:   from
  }

  if (type == 'multiomi' && Object.prototype.toString.call(omis) !== '[object Array]') {
    return error.badRequest(res, 'Invalid parameter: omis must be an array');
  } else if (type == 'multiomi') {
    array = omis;
    omiObj.omis = [];
    groupOmi = new GroupOmiModel(omiObj);
  } else {
    omiObj.to = to;
    omiObj.type = type;
    array.push(omiObj);
  }

  for (var i = 0; i < array.length; i++) {
    var omi = array[i];

    var name   = omi.name
      , amount = omi.amount
      , note   = omi.note
      , from   = omi.from
      , to     = omi.to
      , type   = omi.type;

    if (from != String(user._id) && to != String(user._id)) {
      return error.badRequest(res, '"from" or "to" must be own ID');
    }

    var id = from != String(user._id) ? from : to;
    var transaction;

    var promise = OwerModel.findByIdAsync(id)
    .then(function(ower) {
      if (!ower) {
        throw new NotFoundError('Ower not found');
      }

      if (ower.facebookId == user.facebookId) {
        throw new BadRequestError('Cannot create transaction between self');
      }

      if (ower.counterpart) {
        return OwerModel.findByIdAsync(ower.counterpart)
        .then(function(counterpartOwer) {
          return [ower, counterpartOwer];
        });
      }

      return [ower];
    })
    .spread(function(ower, counterpartOwer) {
      transaction = new TransactionModel({
        name:     name,
        amount:   amount,
        note:     note,
        from:     from,
        to:       to,
        type:     type
      });

      if (groupOmi) {
        transaction.groupOmi = groupOmi._id;
      }

      objects.push(transaction);
      return transaction.validateAsync()
      .then(function() {
        if (groupOmi) {
          groupOmi.omis.push(transaction._id);
        }

        changeBalance(ower, String(to) == String(ower._id), type, amount);
        objects.push(ower);
        return ower.validateAsync()
        .then(function() {
          if (counterpartOwer) {
            changeBalance(counterpartOwer, String(to) != String(ower._id), type, amount);
            objects.push(counterpartOwer);
            return counterpartOwer.validateAsync();
          }
        });
      });
    });

    promises.push(promise);
  }

  if (groupOmi) {
    objects.push(groupOmi);
    promises.push(groupOmi.validateAsync());
  }

  Promise.all(promises)
  .then(function(results) {
    return Promise.all(_.map(objects, function(object) {
      return object.saveAsync();
    }));
  })
  .then(function() {
    if (groupOmi) {
      res.status(201).json(groupOmi.populate());
    } else {
      res.status(201).json(transaction.populate());
    }
  })
  .catch(NotFoundError, error.notFoundHandler(res))
  .catch(BadRequestError, error.badRequestHandler(res))
  .catch(error.serverHandler(res));
};

exports.show = function(req, res) {
  var transactionId = req.param('transaction_id')
    , user          = req.user;

  TransactionModel.findByIdAsync(transactionId)
  .then(function(transaction) {
    if (!transaction) {
      throw new NotFoundError('Transaction not found');
    }

    if (transaction.from != user._id && transaction.to != user._id) {
      OwerModel.findOneAsync({
        type: 'ower',
        $or: [
        {
          _id: transaction.from
        },
        {
          _id: transaction.to
        }]
      })
      .then(function(ower) {
        if (!ower) {
          throw new ForbiddenError('Not authorized to access that transaction');
        }

        return transaction;
      });
    }

    return transaction;
  })
  .then(function(transaction) {
    res.json(transaction);
  })
  .catch(NotFoundError, error.notFoundHandler(res))
  .catch(error.serverHandler(res));
};

var owerForTransaction = function(transaction, user) {
  if (String(transaction.from) == String(user._id)) {
    owerId = transaction.to;
  } else {
    owerId = transaction.from;
  }

  return OwerModel.findByIdAsync(owerId);
};

exports.update = function(req, res) {
  var transactionId = req.param('transaction_id')
    , user          = req.user
    , name          = req.body.name
    , amount        = req.body.amount
    , note          = req.body.note;

  var difference
    , owerId
    , ower
    , counterpartOwer
    , transaction
    , owerIsReceiving;

  TransactionModel.findByIdAsync(transactionId)
  .then(function(aTransaction) {
    transaction = aTransaction;
    if (!transaction) {
      throw new NotFoundError('Transaction not found');
    }

    if (!(String(transaction.from) == String(user._id) || String(transaction.to) == String(user._id))) {
      throw new ForbiddenError('Not authorized to delete this transaction');
    }

    return owerForTransaction(transaction, user);
  })
  .then(function(anOwer) {
    ower = anOwer;
    if (!ower) {
      throw new ServerError('Ower not found');
    }

    if (ower.counterpart) {
      return OwerModel.findByIdAsync(ower.counterpart)
      .then(function(aCounterpartOwer) {
        counterpartOwer = aCounterpartOwer;
      });
    }
  })
  .then(function() {
    if (name) {
      transaction.name = name;
    }
    if (amount) {
      if (isNaN(amount)) {
        throw new BadRequestError('Invalid parameter: amount must be a number');
      }
      difference = amount - transaction.amount;
      transaction.amount = amount;
    }
    if (note) {
      transaction.note = note;
    }

    return transaction.saveAsync();
  })
  .then(function(data) {
    if (difference) {
      return changeBalance(ower, String(transaction.to) == String(ower._id), transaction.type, difference).saveAsync();
    }
  })
  .then(function(data) {
    if (difference) {
      if (counterpartOwer) {
        return changeBalance(counterpartOwer, String(transaction.to) == String(counterpartOwer._id), transaction.type, difference).saveAsync();
      }
    }
  })
  .then(function(data) {
    res.json(transaction);
  })
  .catch(NotFoundError, error.notFoundHandler(res))
  .catch(ForbiddenError, error.forbiddenHandler(res))
  .catch(BadRequestError, error.badRequestHandler(res))
  .catch(error.serverHandler(res));
};

exports.delete = function(req, res) {
  var transactionId = req.param('transaction_id')
    , user          = req.user;

  var ower, counterpartOwer, transaction;

  TransactionModel.findByIdAsync(transactionId)
  .then(function(aTransaction) {
    transaction = aTransaction;
    if (!transaction) {
      throw new NotFoundError('Transaction not found');
    }

    if (!(transaction.from.equals(user._id) || transaction.to.equals(user._id))) {
      throw new ForbiddenError('Not authorized to delete this transaction');
    }

    return owerForTransaction(transaction, user);
  })
  .then(function(anOwer) {
    ower = anOwer;
    if (!ower) {
      throw new ServerError('Ower not found');
    }

    if (ower.counterpart) {
      return OwerModel.findByIdAsync(ower.counterpart)
      .then(function(aCounterpartOwer) {
        counterpartOwer = aCounterpartOwer;
      });
    }
  })
  .then(function() {
    return transaction.removeAsync();
  })
  .then(function(data) {
    return changeBalance(ower, String(transaction.to) == String(ower._id), transaction.type, transaction.amount * -1).saveAsync();
  })
  .then(function(data) {
    if (counterpartOwer) {
      return changeBalance(counterpartOwer, String(transaction.to) == String(counterpartOwer._id), transaction.type, transaction.amount * -1).saveAsync();
    }
  })
  .then(function(data) {
    res.json({
      success: true
    });
  })
  .catch(NotFoundError, error.notFoundHandler(res))
  .catch(ForbiddenError, error.forbiddenHandler(res))
  .catch(error.serverHandler(res));
};
