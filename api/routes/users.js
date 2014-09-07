var users      = require('../controllers/users.js')
  , middleware = require('../utils/middleware.js')
  , fb         = require('../fb.js')
  , error      = require('../utils/error.js');

var authorizedClient = middleware.authorizedClientCredentials;

var hasFriendPermissions = function(req, res, next) {
  if (req.user.fbToken[0].scopes.indexOf(permission) <= -1) {
    return error.unauthorized(res, 'Permission required to access user friends', 1);
  }

  return next();
};

module.exports = function(Router, isValidToken, isFbAuthorized) {
  Router.route('/token')
    .post(authorizedClient, users.login)
    .delete([authorizedClient, isValidToken], users.logout);

  Router.route('/userInfo')
    .get(isValidToken, users.info);

  Router.route('/users/:facebook_id')
    .get(isFbAuthorized, users.show);

  Router.route('/users/:facebook_id/friends')
    .get([isFbAuthorized, hasFriendPermissions], users.allFriends);
};
