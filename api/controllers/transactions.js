var Promise          = require('bluebird')
  , TransactionModel = require('../models/money/transaction.js').TransactionModel
  , GroupOmiModel    = require('../models/money/groupOmi.js').GroupOmiModel
  , OmiRequestModel  = require('../models/requests/omiRequest.js').OmiRequestModel
  , OwerModel        = require('../models/people/ower.js').OwerModel
  , UserModel        = require('../models/people/user.js').UserModel
  , error            = require('../utils/error.js')
  , paginate         = require('../utils/paginate.js');

var ClientErrors   = require('../models/errors/client.js')
  , ExistsError    = ClientErrors.ExistsError
  , NotFoundError  = ClientErrors.NotFoundError
  , ForbiddenError = ClientErrors.ForbiddenError;

var changeBalance = function(ower, owerIsReceiving, type, amount) {
  if ((owerIsReceiving && type === 'omi') || (!owerIsReceiving && type === 'payment')) {
    ower.balance += amount;
  } else {
    ower.balance -= amount;
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

  var promise = Promise.delay(0);

  if (user) {
    promise = orConditions(user, facebookId, conditions);
  }

  promise.then(function() {
    return TransactionModel.findAsync(conditions);
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
    , type       = req.body.type;

  if (from != user._id && to != user._id) {
    return error.badRequest(res, '"from" or "to" must be own ID');
  }

  var id = from != user._id ? from : to;

  var ower, counterpartOwer, transaction;

  OwerModel.findByIdAsync(id)
  .then(function(anOwer) {
    if (!anOwer) {
      throw new NotFoundError('Ower not found');
    }

    ower = anOwer;
    if (anOwer.counterpart) {
      return OwerModel.findByIdAsync(anOwer.counterpart)
      .then(function(aCounterpartOwer) {
        counterpartOwer = aCounterpartOwer;
      });
    }
  })
  .then(function() {
    transaction = new TransactionModel({
      name:   name,
      amount: amount,
      note:   note,
      from:   user._id,
      to:     to,
      type:   type
    });

    return transaction.saveAsync();
  })
  .then(function(data) {
    return changeBalance(ower, to == ower._id, type, amount).saveAsync();
  })
  .then(function(data) {
    if (counterpartOwer) {
      return changeBalance(counterpartOwer, to == counterpartOwer._id, type, amount).saveAsync();
    }
  })
  .then(function(data) {
    res.status(201).json(transaction);
  })
  .catch(NotFoundError, error.notFoundHandler(res))
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

exports.update = function(req, res) {
  return error.notImplemented(res);
};

exports.delete = function(req, res) {
  var transactionId = req.param('transaction_id')
    , user          = req.user;

  TransactionModel.findByIdAsync(transactionId)
  .then(function(transaction) {
    if (!transaction) {
      throw new NotFoundError('Transaction not found');
    }

    if (!(transaction.from.equals(user._id) || transaction.to.equals(user._id))) {
      throw new ForbiddenError('Not authorized to delete this transaction');
    }

    return transaction.removeAsync();
  })
  .then(function() {
    res.json({
      success: true
    });
  })
  .catch(NotFoundError, error.notFoundHandler(res))
  .catch(ForbiddenError, error.forbiddenHandler(res))
  .catch(error.serverHandler(res));
};
