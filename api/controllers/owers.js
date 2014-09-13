var OwerModel        = require('../models/people/ower.js').OwerModel
  , UserModel        = require('../models/people/user.js').UserModel
  , OwerRequestModel = require('../models/requests/owerRequest.js').OwerRequestModel
  , error            = require('../utils/error.js')
  , paginate         = require('../utils/paginate.js')
  , debug            = require('../utils/debug.js');

var ClientErrors  = require('../models/errors/client.js')
  , ExistsError   = ClientErrors.ExistsError
  , NotFoundError = ClientErrors.NotFoundError
  , ConflictError = ClientErrors.ConflictError;

exports.all = function(req, res) {
  var facebookId = req.param('facebook_id')
    , offset     = req.query.offset
    , limit      = req.query.limit
    , name       = req.query.name
    , fbFilterId = req.query.facebook_id;

  var conditions = {
    type: 'ower'
  };

  if (!paginate(req, res, conditions)) {
    return;
  }

  if (name) {
    conditions.name = new RegExp(name, 'i');
  }
  if (fbFilterId) {
    conditions.facebookId = fbFilterId;
  }

  if (facebookId) {
    conditions.tetheredTo = facebookId;
  }

  OwerModel.findAsync(conditions)
  .then(function(owers) {
    res.json(owers);
  })
  .catch(error.serverHandler(res));
};

exports.create = function(req, res) {
  var facebookId = req.user.facebookId
    , name       = req.body.name
    , owerFbId   = req.body.facebook_id;

  if (name && owerFbId) {
    return error.badRequest(res, 'Invalid parameters: must not send name and facebook_id simultaneously');
  }

  if (facebookId == owerFbId) {
    return error.badRequest(res, 'Invalid parameter: facebook_id cannot be own Facebook ID');
  }

  var conditions = {
    tetheredTo: facebookId,
    type:       'ower'
  };

  if (!name) {
    if (!owerFbId) {
      return error.missingParam(res, 'name or facebook_id');
    }

    conditions.facebookId = owerFbId;
  } else {
    conditions.name = name;
  }

  var facebookUser, existingOwer;

  OwerModel.findOneAsync(conditions)
  .then(function(ower) {
    if (ower) {
      throw new ExistsError('Ower already exists');
    }

    if (owerFbId) {
      // we are adding an existing Facebook user

      // find that user
      return UserModel.findOneAsync({
        facebookId: owerFbId,
        type:       'user'
      })
      .then(function(user) {
        if (!user) {
          throw new NotFoundError('User not found');
        }

        facebookUser = user;

        // check if the existing Facebook user has added the logged in Facebook user as an ower
        return OwerModel.findOneAsync({
          tetheredTo: user.facebookId,
          facebookId: facebookId,
          type:       'ower'
        });
      })
      .then(function(ower) {
        if (ower) {
          existingOwer = ower;
          // if they have, then remove the ower request
          return OwerRequestModel.findOneAndRemoveAsync({
            from: owerFbId,
            to: facebookId
          });
        }

        // if they haven't, create an ower request
        var owerRequest = new OwerRequestModel({
          from: facebookId,
          to:   facebookUser.facebookId
        });

        return owerRequest.saveAsync();
      })
    }
  })
  // finally create and send the ower
  .then(function() {
    var properties = {
      name:       name ? name : facebookUser.name,
      tetheredTo: facebookId
    };

    if (owerFbId) {
      properties.facebookId = owerFbId;
    }

    if (existingOwer) {
      properties.counterpart = existingOwer._id;
    }

    debug.log(properties);

    var ower = new OwerModel(properties);

    return ower.saveAsync();
  })
  .spread(function(ower, numAffected) {
    if (existingOwer) {
      existingOwer.counterpart = ower._id;
      return existingOwer.saveAsync()
      .then(function() {
        return ower;
      });
    }

    return ower;
  })
  .then(function(ower) {
    res.status(201).json(ower);
  })
  .catch(NotFoundError, error.notFoundHandler(res))
  .catch(ExistsError, error.existsHandler(res))
  .catch(error.serverHandler(res));
};

exports.show = function(req, res) {
  var owerId = req.param('ower_id')
    , facebookId = req.param('facebook_id');

  OwerModel.findOneAsync({
    _id: owerId,
    tetheredTo: facebookId
  })
  .then(function(ower) {
    if (!ower || ower.type !== 'ower') {
      throw new NotFoundError('Ower not found');
    }

    res.json(ower);
  })
  .catch(NotFoundError, error.notFoundHandler(res))
  .catch(error.serverHandler(res));
};

exports.update = function(req, res) {
  var owerId  = req.param('ower_id')
    , newName = req.body.name
    , newFbId = req.body.facebook_id;

  if (newName && newFbId) {
    return error.badRequest(res, 'Invalid parameters: Must only send name or facebook_id');
  } else if (!newName && !newFbId) {
    return error.missingParam(res, 'name or facebook_id');
  }

  OwerModel.findOneAsync({
    _id:  owerId,
    type: 'ower'
  })
  .then(function(ower) {
    if (!ower) {
      throw new NotFoundError('Ower not found');
    }

    if (ower.facebookId) {
      if (newFbId) {
        throw new ConflictError('Ower already has a facebook ID');
      } else {
        throw new ConflictError('Cannot update name for a Facebook user');
      }
    }

    if (newName) {
      if (ower.name == newName) {
        throw new ConflictError('Ower already has that name');
      }

      ower.name = newName;
      return ower.saveAsync();
    }

    return UserModel.findOneAsync({
      facebookId: newFbId,
      type:       'user'
    })
    .then(function(user) {
      if (!user) {
        throw new NotFoundError('User not found');
      }

      ower.facebookId = facebookId;

      return OwerModel.findOneAsync({
        tetheredTo: facebookId,
        facebookId: newFbId,
        type:       'ower'
      })
    })
    .then(function(counterpartOwer) {
      if (!counterpartOwer) {
        var owerRequest = new OwerRequestModel({
          from: facebookId,
          to:   newFbId
        });

        return owerRequest.saveAsync()
        .then(function(owerRequest) {
          return ower.saveAsync();
        });
      }

      if (counterpartOwer && counterpartOwer.counterpart) {
        debug.log('Counterpart ower already has a counterpart ID for some reason');
      }

      ower.counterpart            = counterpartOwer._id;
      counterpartOwer.counterpart = ower._id;

      return counterpartOwer.saveAsync()
      .then(function(counterpartOwer) {
        return OwerRequestModel.findOneAndRemoveAsync({
          to:   facebookId,
          type: 'ower'
        });
      })
      .then(function(owerRequest) {
        return ower.saveAsync();
      });
    });
  })
  .then(function(ower) {
    res.json(ower);
  })
  .catch(NotFoundError, error.notFoundHandler(res))
  .catch(ConflictError, error.conflictHandler(res))
  .catch(error.serverHandler(res));
};

exports.delete = function(req, res) {
  var owerId = req.param('ower_id');

  OwerModel.findOneAndRemoveAsync({
    _id:  owerId,
    type: 'ower'
  })
  .then(function(ower) {
    if (!ower) {
      throw new NotFoundError('Ower not found');
    }

    var counterpartId = ower.counterpart;
    if (!counterpartId) {
      return ower;
    }

    OwerModel.findByIdAsync(counterpartId)
    .then(function(counterpartOwer) {
      counterpartOwer.counterpart = undefined;
      return counterpartOwer.saveAsync();
    })
    .then(function(counterpartOwer) {
      return ower;
    });
  })
  .then(function(ower) {
    // TODO: Remove transactions and update balances
  })
  .then(function() {
    res.json({
      success: true
    });
  })
  .catch(NotFoundError, error.notFoundHandler(res))
  .catch(error.serverHandler(res));
};
