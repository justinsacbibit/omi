var error = require('./error.js')
  , ClientModel = require('../models/auth/client.js').ClientModel;

var notFound = exports.notFound = function(req, res, next) {
  return error.notFound(res, 'Endpoint');
};

exports.validFacebookId = function(req, res, next) {
  var facebookId = req.param('facebook_id');

  if (isNaN(facebookId)) {
    return error.badRequest(res, 'Invalid parameter: facebook_id');
  }

  return next();
};

exports.isOwnFacebookId = function(req, res, next) {
  var facebookId = req.param('facebook_id')
    , user       = req.user;

  if (user && (user.facebookId != facebookId)) {
    if (process.env.DEBUG) {
      console.log(user);
      console.log(facebookId);
    }

    return error.forbidden(res);
  } else if (!user) {
    return error.forbidden(res);
  }

  return next();
};

var authorizedCredentials = function(req, res, next, admin) {
  var clientId, clientSecret;

  if (req.headers && req.headers['x-client-id']) {
    if (!req.headers['x-client-secret']) {
      return error.missingParam(res, 'x-client-secret');
    }

    clientId     = req.headers['x-client-id'];
    clientSecret = req.headers['x-client-secret'];
  }

  if (req.body && req.body.client_id) {
    if (!req.body['client_secret']) {
      return error.missingParam(res, 'client_secret');
    }

    if ((clientId && clientId !== req.body) || (clientSecret)) {
      return error.badRequest(res, 'Multiple client credentials found in request');
    }

    clientId     = req.body['client_id'];
    clientSecret = req.body['client_secret'];
  }

  if (req.query && req.query['client_id']) {
    if (!req.query['client_secret']) {
      return error.missingParam(res, 'client_secret');
    }

    if (clientId || clientSecret) {
      return error.badRequest(res, 'Multiple client credentials found in request');
    }

    clientId     = req.query['client_id'];
    clientSecret = req.query['client_secret'];
  }

  if (!clientId) {
    if (!clientSecret) {
      return error.missingParam(res, 'Missing client ID and secret');
    }
    return error.missingParam(res, 'Missing client ID in request');
  }

  if (admin) {
    if (clientId !== process.env.ADMIN_ID) {
      return error.forbidden(res);
    }
  }

  ClientModel.findOne({
    clientId: clientId
  }, function(err, client) {
    if (err) {
      error.log(err);
      return error.server(res);
    }

    var checkClient = function() {
      if (client.clientSecret != clientSecret) {
        return error.unauthorized(res, 'Invalid client secret');
      }

      req.client = client;

      return next();
    }

    if (admin && !client) {
      client = new ClientModel({
        name:        'Admin',
        clientId:     process.env.ADMIN_ID,
        clientSecret: process.env.ADMIN_SECRET
      });

      return client.save(function(err) {
        if (err) {
          error.log(err);
          return error.server(res);
        }

        return checkClient();
      });
    }

    return checkClient();
  });
}

exports.authorizedClientCredentials = function(req, res, next) {
  return authorizedCredentials(req, res, next);
};

exports.validAdminCredentials = function(req, res, next) {
  return authorizedCredentials(req, res, next, true);
}
