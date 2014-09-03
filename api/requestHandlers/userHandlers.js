var UserModel         = require('../model/people/user.js').UserModel
  , OwerModel         = require('../model/people/ower.js').OwerModel
  , TetheredOwerModel = require('../model/people/tetheredOwer.js').TetheredOwerModel
  , FBTokenModel      = require('../model/auth/fbToken.js').FBTokenModel
  , error             = require('./error.js')
  , fb                = require('../fb.js')
  , paginate          = require('../paginate.js')
  , debug             = require('../debug.js');

var ascending = function(key) {
  return function(a, b) {
    if (a[key] < b[key]) {
      return -1;
    } else if (a[key] > b[key]) {
      return 1;
    }
    return 0;
  };
};

var logError = function(functionName, failure, err) {
  error.log('user', functionName, failure, err);
};

var getUser = function(req, res) {
  var facebookId = req.param('facebook_id');

  UserModel.findOne({
    facebookId: facebookId
  }, function(err, user) {
    if (err) {
      logError('getUser', 'UserModel.findOne', err);
      return error.server(res);
    }

    return res.json(user);
  });
};

var checkToken = function(res, fbToken) {
  if (fb.expired(fbToken)) {
    error.unauthorized(res, 'Access token has expired, please log in again', 2);
    return false;
  }

  if (fb.needPermissions(fbToken, 'user_friends')) {
    error.unauthorized(res, 'Permission required to access user friends', 1);
    return false;
  }

  return true;
};

var getFriends = function(req, res) {
  var fbToken    = req.user.fbToken[0]
    , facebookId = req.param('facebook_id')
    , name       = req.query.name
    , offset     = req.query.skip
    , limit      = req.query.limit;

  if (!checkToken(res, fbToken)) {
    return;
  }

  var conditions = {
    facebookId: facebookId
  };

  if (!paginate(req, res, conditions)) {
    return;
  }

  fb.friends(fbToken, function(err, friends, totalCount, errMessageObj) {
    if (err) {
      logError('getFriends', 'fb.friends', err);
      return error.server(res);
    }

    if (!friends) {
      return error.server(res);
    }

    if (name) {
      friends = friends.filter(function(element) {
        var fullFriendName = element['name'];
        return fullFriendName.indexOf(name) > -1;
      });
    }

    friends = friends.sort(ascending('name'));

    if (offset && limit) {
      friends = friends.slice(offset, offset + limit);;
    }

    var JSON = {
      friends: friends
    };

    if (totalCount) {
      JSON['total_count'] = totalCount;
    }

    return res.json(JSON);
  });
};

var getOwers = function(req, res) {
  var user       = req.user
    , fbToken    = user.fbToken[0]
    , owerIds    = user.owers
    , facebookId = req.param('facebook_id')
    , offset     = req.query.skip
    , limit      = req.query.limit
    , name       = req.query.name
    , fbFilterId = req.query.facebook_id
    , type       = req.query.type;

  if (!checkToken(res, fbToken)) {
    return;
  }

  var conditions = {
    _id: {
      $in: owerIds
    }
  };

  if (!paginate(req, res, conditions)) {
    return;
  }

  if (name && fbFilterId) {
    return error.badRequest(res, 'Cannot filter by name and facebook_id simultaneously');
  }

  if (fbFilterId && type) {
    return error.badRequest(res, 'Invalid parameters: Cannot filter by facebook_id and type simultaneously');
  }

  if (name) {
    conditions['name'] = new RegExp(name, 'i');
  } else if (fbFilterId) {
    conditions['facebookId'] = fbFilterId;
  }

  if (type) {
    if (type !== 'User' && type !== 'TetheredOwer') {
      return error.badRequest(res, 'Invalid parameter: Type is invalid');
    }
    conditions['_type'] = type;
  }

  debug.log(conditions);

  OwerModel.find(conditions, function(err, owers) {
    if (err) {
      logError('getOwers', 'OwerModel.find', err);
      return error.server(res);
    }

    return res.json(owers);
  });
};

var newOwer = function(req, res) {
  var fbToken    = req.user.fbToken[0]
    , facebookId = req.param('facebook_id')
    , name       = req.body.name
    , owerFbId   = req.body.facebook_id;

  if (!checkToken(res, fbToken)) {
    return;
  }

  if (name && owerFbId) {
    return error.badRequest(res, 'Invalid parameters: must not send name and facebook_id simultaneously in request');
  }

  if (facebookId == owerFbId) {
    return error.badRequest(res, 'Invalid parameter: facebook_id cannot be own Facebook ID');
  }

  var conditions = {
    user:  facebookId,
    _type: 'TetheredOwer'
  };

  if (!name) {
    if (!owerFbId) {
      return error.missingParam(res, 'Name');
    }

    conditions['facebookId'] = owerFbId;
  } else {
    conditions['name'] = name;
  }

  return TetheredOwerModel.findOne(conditions, function(err, tetheredOwer) {
    if (err) {
      logError('newOwer', 'TetheredOwerModel.findOne', err);
      return error.server(res);
    }

    if (tetheredOwer) {
      return error.exists(res, 'Ower');
    }

    var sendOwer = function(owerName) {
      var properties = {
        name: owerName,
        user: facebookId
      };

      if (owerFbId) {
        properties['facebookId'] = owerFbId;
      }

      tetheredOwer = new TetheredOwerModel(properties);

      return tetheredOwer.save(function(err) {
        if (err) {
          logError('newOwer', 'tetheredOwer.save', err);
          return error.server(res);
        }

        req.user.owers.push(tetheredOwer._id);
        req.user.save(function(err) {
          if (err) {
            logError('newOwer', 'user.save', err);
          }
        });

        return res.status(201).json(tetheredOwer);
      });
    };

    if (owerFbId) {
      return UserModel.findOne({
        facebookId: owerFbId
      }, function(err, user) {
        if (err) {
          logError('newOwer', 'UserModel.findOne', err);
          return error.server(res);
        }

        if (!user) {
          return error.notFound(res, 'Facebook user');
        }

        return sendOwer(user.name);
      });
    }

    return sendOwer(name);
  });
};

var getOwer = function(req, res) {
  var fbToken    = req.user.fbToken[0]
    , facebookId = req.param('facebook_id')
    , owerId     = req.param('ower_id');

  if (!checkToken(res, fbToken)) {
    return;
  }

  OwerModel.findById(owerId, function(err, ower) {
    if (err) {
      logError('getOwer', 'OwerModel.findById', err);
      return error.server(res);
    }

    if (!ower) {
      return error.notFound(res, 'Ower');
    }

    res.json(ower);
  });
};

var editOwer = function(req, res) {
  return error.notImplemented(res);
};

var removeOwer = function(req, res) {
  return error.notImplemented(res);
};

exports.user = getUser;
exports.friends = getFriends;
exports.owers = getOwers;
exports.newOwer = newOwer;
exports.ower = getOwer;
exports.editOwer = editOwer;
exports.removeOwer = removeOwer;
