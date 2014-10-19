'use strict';

/**
 * Module dependencies.
 */
var should = require('should'),
		mongoose = require('mongoose'),
		User = mongoose.model('User'),
		Ower = mongoose.model('Ower'),
		LocalTransaction = mongoose.model('LocalTransaction');

/**
 * Globals
 */
var user, ower, localTransaction;

/**
 * Unit tests
 */
describe('Local transaction Model Unit Tests:', function() {
	beforeEach(function(done) {
		user = new User({
			firstName: 'Full',
			lastName: 'Name',
			displayName: 'Full Name',
			email: 'test@test.com',
			username: 'username',
			password: 'password'
		});

		ower = new Ower({
			firstName: 'Ower',
			tetheredTo: user.id
		});

		user.save(function() {
			ower.save(function() {
				localTransaction = new LocalTransaction({
					name: 'Food',
					amount: 5,
					note: 'Lin\'s Garden',
					user: user,
					ower: ower,
					type: 'omi',
					direction: 'toOwer'
				});

				done();
			});
		});
	});

	describe('save()', function() {
		it('should be able to save without problems', function(done) {
			return localTransaction.save(function(err) {
				should.not.exist(err);
				done();
			});
		});
	});

	describe('newLocalTransaction()', function() {
		beforeEach(function() {
			localTransaction = {
					name: 'Food',
					amount: 5,
					note: 'Lin\'s Garden',
					user: user,
					ower: ower,
					type: 'omi',
					direction: 'toOwer'
				};
		});

		it('should save', function(done) {
			return LocalTransaction.newLocalTransaction(localTransaction, ower, function(err, localTransaction) {
				should.not.exist(err);

				LocalTransaction.findOne(function(err, localTransaction) {
					should.not.exist(err);
					should.exist(localTransaction);
					done();
				});
			});
		});

		it('should increase the ower balance', function(done) {
			ower.balance.should.equal(0);
			var _ower = ower;
			return LocalTransaction.newLocalTransaction(localTransaction, ower, function(err, localTransaction) {
				should.not.exist(err);

				Ower.findOne(function(err, ower) {
					should.not.exist(err);

					ower.firstName.should.equal('Ower');
					ower.balance.should.equal(5);
					_ower.id.should.equal(ower.id);
					done();
				});
			});
		});
	});

	describe('update()', function() {
		it('should increase the ower balance', function(done) {
			ower.balance.should.equal(0);
			return LocalTransaction.newLocalTransaction(localTransaction, ower, function(err, localTransaction) {
				should.not.exist(err);

				Ower.findOne(function(err, ower) {
					should.not.exist(err);

					ower.balance.should.equal(5);
					return localTransaction.update({
						amount: 10
					}, ower, function(err, localTransaction) {
						should.not.exist(err);

						localTransaction.amount.should.equal(10);
						Ower.findOne(function(err, ower) {
							should.not.exist(err);

							ower.balance.should.equal(10);
							done();
						});
					});
				});
			});
		});

		it('should flip the ower balance', function(done) {
			ower.balance.should.equal(0);
			return LocalTransaction.newLocalTransaction(localTransaction, ower, function(err, localTransaction) {
				should.not.exist(err);

				Ower.findOne(function(err, ower) {
					should.not.exist(err);

					ower.balance.should.equal(5);
					return localTransaction.update({
						type: 'payment'
					}, ower, function(err, localTransaction) {
						should.not.exist(err);

						localTransaction.amount.should.equal(5);
						Ower.findOne(function(err, ower) {
							should.not.exist(err);

							ower.balance.should.equal(-5);
							done();
						});
					});
				});
			});
		});
	});

	describe('delete()', function() {
		it('should update the balance', function(done) {
			ower.balance.should.equal(0);
			return LocalTransaction.newLocalTransaction(localTransaction, ower, function(err, localTransaction) {
				should.not.exist(err);

				Ower.findOne(function(err, ower) {
					should.not.exist(err);

					ower.balance.should.equal(5);
					return localTransaction.delete(ower, function(err, localTransaction) {
						should.not.exist(err);

						Ower.findOne(function(err, ower) {
							should.not.exist(err);

							ower.balance.should.equal(0);
							done();
						});
					});
				});
			});
		});
	});

	afterEach(function(done) {
		LocalTransaction.remove().exec();
		Ower.remove().exec();
		User.remove().exec();

		done();
	});
});