var error = require('./requestHandlers/error.js');

var notFound = function(req, res, next) {
  return error.notFound(res, 'Endpoint');
};

var ownership = function(req, res, next) {
  var facebookId = req.param('facebook_id')
    , user       = req.user;

  if (user.facebookId != facebookId) {
    if (process.env.DEBUG) {
      console.log(user);
      console.log(facebookId);
    }

    if (isNaN(facebookId)) {
      return error.badRequest(res, 'Invalid parameter: facebook_id must be a number');
    }

    return error.forbidden(res);
  }

  return next();
}

exports.notFound = function() {
  return notFound;
}

exports.ownership = function() {
  return ownership;
}
