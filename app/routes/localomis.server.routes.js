'use strict';

module.exports = function(app) {
	var users = require('../../app/controllers/users'),
			localTransactions = require('../controllers/local-transactions');

	// Localomis Routes
	app.route('/localomis')
		.get(users.requiresLogin, localTransactions.list)
		.post(users.requiresLogin, localTransactions.attachOwer, localTransactions.canCreate, localTransactions.create);

	app.route('/localomis/:localomiId')
		.get(users.requiresLogin, localTransactions.hasAuthorization, localTransactions.read)
		.put(users.requiresLogin, localTransactions.attachOwer, localTransactions.hasAuthorization, localTransactions.update)
		.delete(users.requiresLogin, localTransactions.attachOwer, localTransactions.hasAuthorization, localTransactions.delete);

	// Finish by binding the Localomi middleware
	app.param('localomiId', localTransactions.localTransactionById);
};