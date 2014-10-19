'use strict';

module.exports = function(app) {
	var users = require('../../app/controllers/users'),
			transactions = require('../controllers/transactions'),
	    omis = require('../../app/controllers/omis');

	// Omis Routes
	app.route('/omis')
		.get(transactions.list)
		.post(users.requiresLogin, omis.create);

	app.route('/omis/:omiId')
		.get(users.requiresLogin, transactions.hasAuthorization, transactions.read)
		.put(users.requiresLogin, omis.hasAuthorization, omis.update)
		.delete(users.requiresLogin, omis.hasAuthorization, omis.delete);

	// Finish by binding the Omi middleware
	app.param('omiId', transactions.transactionById);
};