'use strict';

/**
 * Module dependencies.
 */
var should = require('should'),
	mongoose = require('mongoose'),
	User = mongoose.model('User'),
	Balance = mongoose.model('Balance'),
	Transaction = mongoose.model('Transaction');

/**
 * Globals
 */
var user1, user2, transaction, updatedTransaction;

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

	describe('save()', function() {
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

	describe('newTransaction()', function() {
		it('should update the balance', function(done) {
			var data = {
				name: 'Sushi',
				amount: 20,
				note: 'Spring Sushi',
				from: user1.id,
				to: user2.id,
				type: 'omi'
			};

			Transaction.newTransaction(data, function(err, transaction) {
				should.not.exist(err);

				Balance.findOne().exec(function(err, balance) {
					should.not.exist(err);

					balance.balance.should.equal(20);
					done();
				});
			});
		});
	});

	describe('update()', function() {
		beforeEach(function(done) {
			var data = {
				name: 'Sushi',
				amount: 20,
				note: 'Spring Sushi',
				from: user1.id,
				to: user2.id,
				type: 'omi'
			};

			Transaction.newTransaction(data, function(err, transaction) {
				should.not.exist(err);

				Balance.findOne().exec(function(err, balance) {
					should.not.exist(err);

					balance.balance.should.equal(20);
					updatedTransaction = transaction;
					done();
				});
			});
		});

		it('should increase the balance', function(done) {
			updatedTransaction.update({
				amount: 25
			}, function(err, transaction) {
				should.not.exist(err);

				Balance.findOne().exec(function(err, balance) {
					should.not.exist(err);

					balance.balance.should.equal(25);
					done();
				});
			});
		});

		it('should decrease the balance', function(done) {
			updatedTransaction.update({
				amount: 15
			}, function(err, transaction) {
				should.not.exist(err);

				Balance.findOne().exec(function(err, balance) {
					should.not.exist(err);

					balance.balance.should.equal(15);
					done();
				});
			});
		});

		it('should not allow a balance of 0', function(done) {
			updatedTransaction.update({
				amount: 0
			}, function(err, transaction) {
				should.exist(err);
				done();
			});
		});

		it('should require from and to to be either the same as before, or swapped', function(done) {
			updatedTransaction.update({
				from: updatedTransaction.from,
				to: updatedTransaction.from
			}, function(err, transaction) {
				should.exist(err);
				done();
			});
		});

		it('should error if only one of from and to are included', function(done) {
			updatedTransaction.update({
				from: updatedTransaction.from
			}, function(err, transaction) {
				should.exist(err);
				done();
			});
		});

		it('should change signs if the type changes', function(done) {
			updatedTransaction.update({
				type: 'payment'
			}, function(err, transaction) {
				should.not.exist(err);

				Balance.findOne().exec(function(err, balance) {
					should.not.exist(err);

					balance.balance.should.equal(-20);
					done();
				});
			});
		});
	});

	afterEach(function(done) {
		Transaction.remove().exec();
		Balance.remove().exec();
		User.remove().exec();

		done();
	});
});