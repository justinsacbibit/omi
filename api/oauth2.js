var passport          = require('passport')
  , oauth2orize       = require('oauth2orize')
  , crypto            = require('crypto')
  , UserModel         = require('./model/people/user.js').UserModel
  , ClientModel       = require('./model/auth/client.js').ClientModel
  , AccessTokenModel  = require('./model/auth/accessToken.js').AccessTokenModel
  , fb                = require('./fb.js');

var server = oauth2orize.createServer();

var updateToken = function(client, fbToken, done) {
  var tokenValue = crypto.randomBytes(32).toString('base64');

  var token = new AccessTokenModel({
    token:      value,
    clientId:   client.clientId,
    facebookId: fbToken.facebookId
  });

  var info = {
    scope: '*'
  };

  var upsertData = token.toObject();
  delete upsertData._id;

  token.update({
    clientId:   client.clientId,
    facebookId: fbToken.facebookId
  }, upsertData, {
    upsert: true
  }, function(err) {
    if (err) {
      return done(err);
    }

    return done(null, tokenValue, null, {
      'expires_in': process.env.TOKEN_LIFE
    });
  });
};

server.exchange(oauth2orize.exchange.password(function(client, username, fbAccessToken, scope, done) {
  fb.login(fbAccessToken, function(err, facebookId, errMessageObj) {
    if (err) {
      return done(err);
    }

    if (!facebookId) {
      return done(null, false, errMessageObj);
    }

    UserModel.findOne({
      facebookId: facebookId
    }, function(err, user) {
      if (err) {
        return done(err);
      }

      if (!user) {
        return fb.name(fbAccessToken, function(err, name, errMessageObj) {
          if (err) {
            return done(err);
          }

          if (!name) {
            return done(null, false, errMessageObj);
          }

          var user = new UserModel({
            name: name,
            facebookId: facebookId
          });

          user.save(function(err) {
            if (err) {
              return done(err);
            }

            return updateToken(client, fbToken, done);
          });
        });
      }

      return updateToken(client, fbToken, done);
    });
  });
}));

exports.token = [
  passport.authenticate(['oauth2-client-password'], {
    session: false
  }),
  server.token(),
  server.errorHandler()
];
