var UserModel    = require('../model/people/user.js').UserModel
  , FBTokenModel = require('../model/auth/fbToken.js').FBTokenModel
  , error        = require('./error.js')
  , fb           = require('../fb.js')
  , paginate     = require('../paginate.js');

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

  FBTokenModel.findOne({
    facebookId: facebookId
  }, function(err, fbToken) {
    if (err) {
      logError('getFriends', 'FBTokenModel.findOne', err);
      return error.server(res);
    }

    if (fb.expired(fbToken)) {
      return error.unauthorized(res, 'Access token has expired, please log in again', 2);
    }

    if (fb.needPermissions(fbToken, 'user_friends')) {
      return error.unauthorized(res, 'Permission required to access user friends', 1);
    }

    fb.friends(facebookId, function(err, friends, totalCount, errMessageObj) {
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

      friends = friends.sort(function(a, b) {
        if (a['name'] < b['name']) {
          return -1;
        } else if (a['name'] > b['name']) {
          return 1;
        }
        return 0;
      }).slice(req.query.offset, req.query.offset + req.query.limit);

      return res.json(friends);
    });
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
