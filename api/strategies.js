var BearerStrategy         = require('passport-http-bearer').Strategy
  , UserModel              = require('./model/people/user').UserModel
  , ClientModel            = require('./model/auth/client.js').ClientModel
  , AccessTokenModel       = require('./model/auth/accessToken.js').AccessTokenModel;

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

    UserModel.findOne({
      facebookId: token.facebookId
    }, function(err, user) {
      if (err) {
        return done(err);
      }

      if (!user) {
        return done(null, false, {
          message: 'Unknown user'
        });
      }

      return done(null, user);
    });
  });
});

exports.init = function(passport) {
  passport.use(bearerStrategy);
};
