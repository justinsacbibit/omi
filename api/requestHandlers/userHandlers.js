var UserModel         = require('../model/people/user.js').UserModel
  , OwerModel         = require('../model/people/ower.js').OwerModel
  , TetheredOwerModel = require('../model/people/tetheredOwer.js').TetheredOwerModel
  , FBTokenModel      = require('../model/auth/fbToken.js').FBTokenModel
  , error             = require('./error.js')
  , fb                = require('../fb.js')
  , paginate          = require('../paginate.js');

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

var checkToken = function(fbToken) {
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

  if (!checkToken(fbToken)) {
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
  var fbToken    = req.user.fbToken[0]
    , facebookId = req.param('facebook_id')
    , offset     = req.query.skip
    , limit      = req.query.limit
    , name       = req.query.name
    , fbFilterId = req.query.facebook_id
    , type       = req.query.type;

  if (!checkToken(fbToken)) {
    return;
  }

  var conditions = {
    facebookId: facebookId
  };

  if (!paginate(req, res, conditions)) {
    return;
  }

  if (name && fbFilterId) {
    return error.badRequest(res, 'Cannot filter by name and facebook_id simultaneously');
  }

  if (fbFilterId && type) {
    return error.badRequest(res, 'Cannot filter by facebook_id and type simultaneously');
  }

  if (name) {
    conditions['name'] = new RegExp(name, 'i');
  } else if (fbFilterId) {
    conditions['facebookId'] = fbFilterId;
  }

  OwerModel.find(conditions, function(err, owers) {
    if (err) {
      logError('getOwers', 'OwerModel.find', err);
      return error.server(res);
    }

    return res.json(owers);
  });
};

var newOwer = function(req, res) {

};

var getOwer = function(req, res) {
  return error.notImplemented(res);
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
