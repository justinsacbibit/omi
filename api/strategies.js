var BearerStrategy         = require('passport-http-bearer').Strategy
  , ClientPasswordStrategy = require('passport-oauth2-client-password').Strategy
  , UserModel              = require('./model/people/user').UserModel
  , ClientModel            = require('./model/auth/client.js').ClientModel
  , AccessTokenModel       = require('./model/auth/accessToken.js').AccessTokenModel;

var clientPasswordStrategy = new ClientPasswordStrategy(function(clientId, clientSecret, done) {
  ClientModel.findOne({
    clientId: clientId
  }, function(err, client) {
    if (err) {
      console.log(err)
      return done(err);
    }

    if (!client) {
      console.log('no client')
      return done(null, false);
    }

    if (client.clientSecret != clientSecret) {
      return done(null, false);
    }

    return done(null, client);
  });
});

var bearerStrategy = new BearerStrategy(function(accessToken, done) {
  AccessTokenModel.findOne({
    token: accessToken
  }, function(err, token) {
    if (err) {
      return done(err);
    }

    if (!token) {
      return done(null, false);
    }

    if (Math.round((Date.now() - token.created) / 1000) > process.env.TOKEN_LIFE) {
      AccessTokenModel.remove({
        token: accessToken
      }, function(err) {
        if (err) {
          return done(err);
        }
      });

      return done(null, false, {
        message: 'Token expired'
      });
    }

    UserModel.findById(token.facebookId, function(err, user) {
      if (err) {
        return done(err);
      }

      if (!user) {
        return done(null, false, {
          message: 'Unknown user'
        });
      }

      var info = {
        scope: '*'
      }
      return done(null, user, info);
    });
  });
});

exports.init = function(passport) {
  passport.use(clientPasswordStrategy);
  passport.use(bearerStrategy);
};
