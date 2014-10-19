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
					user1: String(user1.id) < String(user2.id) ? user1 : user2,
					user2: String(user1.id) < String(user2.id) ? user2 : user1
				});

				done();
			});
		});
	});

	describe('save()', function() {
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

		it('should error if the users are not in alphabetical order', function(done) {
			balance.user1 = user2;
			balance.user2 = user1;
			return balance.save(function(err) {
				should.exist(err);
				done();
			});
		});
	});

	describe('getBalance()', function() {
		it('retrieves the balance', function(done) {
			return balance.save(function(err) {
				should.not.exist(err);

				Balance.getBalance(balance.user1, balance.user2, function(err, sameBalance) {
					should.not.exist(err);

					sameBalance.id.should.equal(balance.id);
					done();
				});
			});
		});

		it('works when users are out of order', function(done) {
			return balance.save(function(err) {
				should.not.exist(err);

				Balance.getBalance(balance.user2, balance.user1, function(err, sameBalance) {
					should.not.exist(err);

					sameBalance.id.should.equal(balance.id);
					done();
				});
			});
		});

		it('creates a balance if one does not exist', function(done) {
			Balance.getBalance(balance.user1, balance.user2, function(err, balance) {
				should.not.exist(err);
				should.exist(balance);

				Balance.findOne().exec(function(err, sameBalance) {
					should.not.exist(err);
					should.exist(sameBalance);

					sameBalance.id.should.equal(balance.id);
					done();
				});
			});
		});
	});

	describe('changeBalance()', function() {
		it('errors if the users are not correct', function(done) {
			return balance.save(function(err) {
				should.not.exist(err);

				balance.changeBalance(5, 'a', 'b').should.equal(false);
				done();
			});
		});

		it('works', function(done) {
			return balance.save(function(err) {
				should.not.exist(err);

				balance.balance.should.equal(0);
				balance.changeBalance(5, balance.user1, balance.user2).should.equal(true);
				balance.balance.should.equal(5);
				done();
			});
		});

		it('still works when reversing users', function(done) {
			return balance.save(function(err) {
				should.not.exist(err);

				balance.balance.should.equal(0);
				balance.changeBalance(5, balance.user2, balance.user1).should.equal(true);
				balance.balance.should.equal(-5);
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