'use strict';

/**
 * Module dependencies.
 */
var should = require('should'),
	mongoose = require('mongoose'),
	User = mongoose.model('User'),
	AccessToken = mongoose.model('AccessToken');

/**
 * Globals
 */
var user, accessToken;

/**
 * Unit tests
 */
describe('Access token Model Unit Tests:', function() {
	beforeEach(function(done) {
		user = new User({
			firstName: 'Full',
			lastName: 'Name',
			displayName: 'Full Name',
			email: 'test@test.com',
			username: 'username',
			password: 'password'
		});

		user.save(function() {
			accessToken = new AccessToken({
				user: user.id,
				token: 'asdfasdf'
			});

			done();
		});
	});

	describe('Method Save', function() {
		it('should be able to save without problems', function(done) {
			return accessToken.save(function(err) {
				should.not.exist(err);
				done();
			});
		});

		it('should not save without a user ID', function(done) {
			accessToken.user = undefined;
			return accessToken.save(function(err) {
				should.exist(err);
				done();
			});
		});

		it('should not save without a token', function(done) {
			accessToken.token = undefined;
			return accessToken.save(function(err) {
				should.exist(err);
				done();
			});
		});

		it('is not expired', function(done) {
			return accessToken.save(function(err) {
				should.not.exist(err);
				accessToken.isExpired().should.equal(false);
				done();
			});
		});

		it('can be expired', function(done) {
			accessToken.created = new Date('2011/05/11');
			return accessToken.save(function(err) {
				should.not.exist(err);
				accessToken.isExpired().should.equal(true);
				done();
			});
		});

		it('generates a new token', function() {
			var token = AccessToken.newToken(user.id);
			String(token.user).should.equal(String(user.id));
			should.exist(token.token);
		});
	});

	afterEach(function(done) {
		AccessToken.remove().exec();
		User.remove().exec();

		done();
	});
});