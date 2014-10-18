'use strict';

/**
 * Module dependencies.
 */
var passport = require('passport'),
    BearerStrategy = require('passport-http-bearer').Strategy,
    User = require('mongoose').model('User'),
    AccessToken = require('mongoose').model('AccessToken');

module.exports = function() {
  passport.use(new BearerStrategy(function(accessToken, done) {
    AccessToken.findOne({
      token: accessToken
    }, function(err, token) {
      if (err) {
        return done(err);
      }

      if (!token) {
        return done(null, false);
      }

      if (token.isExpired()) {
        AccessToken.remove({
          token: accessToken
        });

        return done(null, false, {
          message: 'Token expired'
        });
      }

      User.findById(token.user, function(err, user) {
        if (err) {
          return done(err);
        }

        if (!user) {
          return done(null, false, {
            message: 'Unknown user'
          });
        }
        user.accessToken = token;

        return done(null, user);
      });
    });
  }));
};
