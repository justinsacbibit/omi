var passport         = require('passport')
  , crypto           = require('crypto')
  , AccessTokenModel = require('../model/auth/accessToken.js').AccessTokenModel
  , ClientModel      = require('../model/auth/client.js').ClientModel
  , FBTokenModel     = require('../model/auth/fbToken.js').FBTokenModel
  , UserModel        = require('../model/people/user.js').UserModel
  , fb               = require('../fb.js')
  , error            = require('./error.js');

var logError = function(functionName, failure) {
  error.log('auth', functionName, failure);
};

var updateToken = function(client, user, facebookId, res) {
  var tokenValue = crypto.randomBytes(32).toString('base64');

  AccessTokenModel.findOne({
    clientId:   client.clientId,
    facebookId: facebookId
  }, function(err, token) {
    if (err) {
      logError('updateToken', 'AccessTokenModel.findOne');
      return error.server(res);
    }

    var successJSON = function(token) {
      return {
        token: {
          access_token: token.token,
          expires:      process.env.TOKEN_LIFE
        },
        user: {
          facebook_id: facebookId,
          name:        user.name
        }
      };
    }

    if (!token) {
      token = new AccessTokenModel({
        token:      tokenValue,
        clientId:   client.clientId,
        facebookId: facebookId
      });

      return token.save(function(err) {
        if (err) {
          logError('updateToken', 'AccessTokenModel.save');
          return error.server(res);
        }

        return res.status(201).json(successJSON(token));
      });
    }

    token.token = tokenValue;
    token.created = Date.now();
    token.save(function(err) {
      if (err) {
        logError('updateToken', 'AccessTokenModel.save');
        return error.server(res);
      }

      return res.status(201).json(successJSON(token));
    });
  });
};

var login = function(req, res) {
  var clientId = req.body['client_id']
    , clientSecret = req.body['client_secret']
    , fbAccessToken = req.body['fb_access_token']

  if (!clientId) {
    return error.missingParam(res, 'client_id');
  } else if (!clientSecret) {
    return error.missingParam(res, 'client_secret');
  } else if (!fbAccessToken) {
    return error.missingParam(res, 'fb_access_token');
  }

  ClientModel.findOne({
    clientId: clientId
  }, function(err, client) {
    if (err) {
      logError('login', 'ClientModel.findOne');
      return error.server(res);
    }

    if (!client) {
      return error.notFound(res, 'Client');
    }

    if (client.clientSecret !== clientSecret) {
      return error.unauthorized(res, 'Wrong client secret')
    }

    fb.login(fbAccessToken, function(err, facebookId, errMessageObj) {
      if (err) {
        logError('login', 'fb.login');
        return error.server(res);
      }

      if (!facebookId) {
        return error.gateway(res, errMessageObj['message']);
      }

      UserModel.findOne({
        facebookId: facebookId
      }, function(err, user) {
        if (err) {
          logError('login', 'UserModel.findOne');
          return error.server(res);
        }

        if (!user) {
          return fb.name(fbAccessToken, function(err, name, errMessageObj) {
            if (err) {
              logError('login', 'fb.name');
              return error.server(res);
            }

            if (!name) {
              return error.gateway(res, errMessageObj['message']);
            }

            var user = new UserModel({
              name:       name,
              facebookId: facebookId
            });

            user.save(function(err) {
              if (err) {
                logError('login', 'UserModel.save');
                return error.server(res);
              }

              return updateToken(client, user, facebookId, res);
            });
          });
        }

        return updateToken(client, user, facebookId, res);
      });
    });
  });
};

var logout = function(req, res) {
  var token;

  if (req.headers && req.headers.authorization) {
    var parts = req.headers.authorization.split(' ');
    if (parts.length == 2) {
      var scheme = parts[0]
        , credentials = parts[1];

      if (/^Bearer$/i.test(scheme)) {
        token = credentials;
      }
    } else {
      return error.unauthorized(res, 'Invalid authorization header');
    }
  }

  if (req.body && req.body.access_token) {
    if (token) {
      return error.badRequest(res, 'Multiple tokens found in request');
    }

    token = req.body.access_token;
  }

  if (req.query && req.query.access_token) {
    if (token) {
      return error.badRequest(res, 'Multiple tokens found in request');
    }

    token = req.query.access_token;
  }

  if (!token) {
    return error.unauthorized(res, 'Missing access token in request');
  }

  AccessTokenModel.findOne({
    token: token
  }, function(err, accessToken) {
    if (err) {
      logError('logout', 'AccessTokenModel.findOne');
      return error.server(res);
    }

    if (!accessToken) {
      return error.unauthorized(res, 'Invalid access token');
    }

    var conditions = {
      facebookId: accessToken.facebookId,
      clientId:   accessToken.clientId
    };

    FBTokenModel.remove(conditions, function(err) {
      if (err) {
        logError('logout', 'FBTokenModel.remove');
      }
    });

    AccessTokenModel.remove(conditions, function(err) {
      if (err) {
        logError('logout', 'AccessTokenModel.remove');
        return error.server(res);
      }

      return res.json({
        success: true
      });
    });
  });
};

exports.login = [
  login
]

exports.logout = [
  logout
]
