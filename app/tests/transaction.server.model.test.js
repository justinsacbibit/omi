'use strict';

/**
 * Module dependencies.
 */
var should = require('should'),
	mongoose = require('mongoose'),
	User = mongoose.model('User'),
	Transaction = mongoose.model('Transaction');

/**
 * Globals
 */
var user1, user2, transaction;

/**
 * Unit tests
 */
describe('Transaction Model Unit Tests:', function() {
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
				transaction = new Transaction({
					name: 'Movie',
					amount: 10,
					note: 'Ape',
					from: user1.id,
					to: user2.id,
					type: 'omi'
				});

				done();
			});
		});
	});

	describe('Method Save', function() {
		it('should be able to save without problems', function(done) {
			return transaction.save(function(err) {
				should.not.exist(err);
				done();
			});
		});

		it ('should error if the sender is the receiver', function(done) {
			transaction.to = user1.id;
			return transaction.save(function(err) {
				should.exist(err);
				done();
			});
		});
	});

	afterEach(function(done) {
		Transaction.remove().exec();
		User.remove().exec();

		done();
	});
});