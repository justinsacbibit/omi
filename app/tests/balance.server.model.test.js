'use strict';

/**
 * Module dependencies.
 */
var should = require('should'),
	mongoose = require('mongoose'),
	User = mongoose.model('User'),
	Balance = mongoose.model('Balance');

/**
 * Globals
 */
var user1, user2, balance;

/**
 * Unit tests
 */
describe('Balance Model Unit Tests:', function() {
	beforeEach(function(done) {
		user1 = new User({
			firstName: 'Full1',
			lastName: 'Name1',
			displayName: 'Full Name1',
			email: 'test1@test.com',
			username: 'username1',
			password: 'password1'
		});

		user2 = new User({
			firstName: 'Full2',
			lastName: 'Name2',
			displayName: 'Full Name2',
			email: 'test2@test.com',
			username: 'username2',
			password: 'password2'
		});

		user1.save(function() {
			user2.save(function() {
				balance = new Balance({
					user1: user1,
					user2: user2
				});

				done();
			});
		});
	});

	describe('Method Save', function() {
		it('should be able to save without problems', function(done) {
			return balance.save(function(err) {
				should.not.exist(err);
				done();
			});
		});

		it('should error if the users are equal', function(done) {
			balance.user2 = user1;
			return balance.save(function(err) {
				should.exist(err);
				done();
			});
		});

		it('should require user1', function(done) {
			balance.user1 = undefined;
			return balance.save(function(err) {
				should.exist(err);
				done();
			});
		});

		it('should require user2', function(done) {
			balance.user2 = undefined;
			return balance.save(function(err) {
				should.exist(err);
				done();
			});
		});
	});

	afterEach(function(done) {
		Balance.remove().exec();
		User.remove().exec();

		done();
	});
});