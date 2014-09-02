var error = require('./requestHandlers/error.js');

var notFound = function(req, res, next) {
  return error.notFound('Endpoint', res);
};

var ownership = function(req, res, next) {
  if (req.user.facebookId !== req.param('facebook_id')) {
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
