var passport         = require('passport')
  , crypto           = require('crypto')
  , AccessTokenModel = require('../model/auth/accessToken.js').AccessTokenModel
  , ClientModel      = require('../model/auth/client.js').ClientModel
  , FBTokenModel     = require('../model/auth/fbToken.js').FBTokenModel
  , UserModel        = require('../model/people/user.js').UserModel
  , fb               = require('../fb.js');

var updateToken = function(client, user, facebookId, res) {
  var tokenValue = crypto.randomBytes(32).toString('base64');

  var info = {
    scope: '*'
  };

  AccessTokenModel.findOne({
    clientId:   client.clientId,
    facebookId: facebookId
  }, function(err, token) {
    if (err) {
      return res.status(500).json({
        error: err.message
      });
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

      token.save(function(err) {
        if (err) {
          return res.status(500).json({
            error: err.message
          });
        }

        return res.status(201).json(successJSON(token));
      });
    }

    token.token = tokenValue;
    token.created = Date.now();
    token.save(function(err) {
      if (err) {
        return res.status(500).json({
          error: err.message
        });
      }

      return res.status(201).json(successJSON(token));
    });
  });
};

var login = function(req, res) {
  ClientModel.findOne({
    clientId: req.body['client_id']
  }, function(err, client) {
    if (err) {
      return res.status(500).json({
        error: err.message
      });
    }

    if (!client) {
      return res.status(404).json({
        error: 'Client not found'
      })
    }

    if (client.clientSecret !== req.body['client_secret']) {
      return res.status(403).json({
        error: 'Wrong client secret'
      });
    }

    var fbAccessToken = req.body['fb_access_token'];
    fb.login(fbAccessToken, function(err, facebookId, errMessageObj) {
      if (err) {
        return res.status(500).json({
          error: err.message
        });
      }

      if (!facebookId) {
        return res.status(500).json({
          error: errMessageObj['message']
        });
      }

      UserModel.findOne({
        facebookId: facebookId
      }, function(err, user) {
        if (err) {
          return res.status(500).json({
            error: err.message
          });
        }

        if (!user) {
          return fb.name(fbAccessToken, function(err, name, errMessageObj) {
            if (err) {
              return res.status(500).json({
                error: err.message
              });
            }

            if (!name) {
              return res.status(500).json({
                error: errMessageObj['message']
              });
            }

            var user = new UserModel({
              name:       name,
              facebookId: facebookId
            });

            user.save(function(err) {
              if (err) {
                return res.status(500).json({
                  error: err.message
                });
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
      return req.status(400).json({
        error: 'Invalid authorization header'
      });
    }
  }

  if (req.body && req.body.access_token) {
    if (token) {
      return res.status(400).json({
        error: 'Multiple tokens found'
      });
    }

    token = req.body.access_token;
  }

  if (req.query && req.query.access_token) {
    if (token) {
      return res.status(400).json({
        error: 'Multiple tokens found'
      });
    }

    token = req.query.access_token;
  }

  if (!token) {
    return res.status(401).json({
      error: 'Missing access token'
    });
  }

  AccessTokenModel.findOne({
    token: token
  }, function(err, accessToken) {
    if (err) {
      return res.status(500).json({
        error: err.message
      });
    }

    if (!accessToken) {
      return res.status(404).json({
        error: 'Invalid access token'
      });
    }

    var conditions = {
      facebookId: accessToken.facebookId,
      clientId:   accessToken.clientId
    };

    FBTokenModel.remove(conditions, function(err) {
      if (err) {
        console.log('Error removing Facebook token when logging out: %s', err.message);
      }
    });

    AccessTokenModel.remove(conditions, function(err) {
      if (err) {
        return res.status(500).json({
          error: err.message
        });
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
