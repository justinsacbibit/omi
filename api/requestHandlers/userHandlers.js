var UserModel    = require('../model/people/user.js').UserModel
  , FBTokenModel = require('../model/auth/fbToken.js').FBTokenModel
  , error        = require('./error.js')
  , fb           = require('../fb.js')
  , paginate     = require('../paginate.js');

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
  UserModel.findOne({
    facebookId: req.param('facebook_id')
  }, function(err, user) {
    if (err) {
      logError('getUser', 'UserModel.findOne', err);
      return error.server(res);
    }

    return res.json(user);
  });
};

var getFriends = function(req, res) {
  var facebookId = req.param('facebook_id');

  var conditions = {
    facebookId: facebookId
  };

  if (!paginate(req, res, conditions)) {
    return;
  }

  var fbToken = req.user.fbToken[0];

  if (fb.expired(fbToken)) {
    return error.unauthorized(res, 'Access token has expired, please log in again', 2);
  }

  if (fb.needPermissions(fbToken, 'user_friends')) {
    return error.unauthorized(res, 'Permission required to access user friends', 1);
  }

  fb.friends(fbToken, function(err, friends, totalCount, errMessageObj) {
    if (err) {
      logError('getFriends', 'fb.friends', err);
      return error.server(res);
    }

    if (!friends) {
      return error.server(res);
    }

    var name = req.query.name;

    if (name) {
      friends = friends.filter(function(element) {
        var fullFriendName = element['name'];
        return fullFriendName.indexOf(name) > -1;
      });
    }

    friends = friends.sort(ascending('name'))
                     .slice(req.query.offset, req.query.offset + req.query.limit);

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
  // paginate
  return error.notImplemented(res);
};

var newOwer = function(req, res) {
  return error.notImplemented(res);
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
