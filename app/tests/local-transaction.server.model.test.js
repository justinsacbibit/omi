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

	describe('Method Save', function() {
		it('should be able to save without problems', function(done) {
			return localTransaction.save(function(err) {
				should.not.exist(err);
				done();
			});
		});
	});

	afterEach(function(done) {
		LocalTransaction.remove().exec();
		User.remove().exec();

		done();
	});
});