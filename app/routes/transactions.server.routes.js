'use strict';

/**
 * Module dependencies
 */
var transactions = require('../controllers/transactions'),
    users = require('../controllers/users');

module.exports = function(app) {
  app.route('/api/v1/transactions')
    .get(users.requiresToken, transactions.list)
    .post(users.requiresToken, transactions.canCreate, transactions.create);

  app.route('api/v1/transactions/:transactionId')
    .get(users.requiresToken, transactions.hasAuthorization, transactions.read)
    .put(users.requiresToken, transactions.hasAuthorization, transactions.update)
    .delete(users.requiresToken, transactions.hasAuthorization, transactions.delete);

  app.param('transactionId', transactions.transactionById);
};