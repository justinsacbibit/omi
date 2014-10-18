'use strict';

/**
 * Module dependencies.
 */
var passport = require('passport'),
	  LocalStrategy = require('passport-local').Strategy,
	  AccessToken = require('mongoose').model('AccessToken'),
	  User = require('mongoose').model('User');

module.exports = function() {
	// Use local strategy
	passport.use(new LocalStrategy({
			usernameField: 'username',
			passwordField: 'password'
		},
		function(username, password, done) {
			User.findOne({
				username: username
			}, function(err, user) {
				if (err) {
					return done(err);
				}
				if (!user) {
					return done(null, false, {
						message: 'Unknown user or invalid password'
					});
				}
				if (!user.authenticate(password)) {
					return done(null, false, {
						message: 'Unknown user or invalid password'
					});
				}

				var accessToken = AccessToken.newToken(user.id);
				return accessToken.save(function(err) {
					if (err) {
						return done(err);
					}
					user.accessToken = accessToken;

					return done(null, user);
				});
			});
		}
	));
};
