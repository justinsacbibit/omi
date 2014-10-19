'use strict';

module.exports = function(app) {
	var users = require('../../app/controllers/users'),
			transactions = require('../controllers/transactions');

	// Omis Routes
	app.route('/omis')
		.get(users.requiresLogin, transactions.list)
		.post(users.requiresLogin, transactions.canCreate, transactions.create);

	app.route('/omis/:omiId')
		.get(users.requiresLogin, transactions.hasAuthorization, transactions.read)
		.put(users.requiresLogin, transactions.hasAuthorization, transactions.update)
		.delete(users.requiresLogin, users.hasAuthorization, transactions.delete);

	// Finish by binding the Omi middleware
	app.param('omiId', transactions.transactionById);
};