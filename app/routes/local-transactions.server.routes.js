'use strict';

module.exports = function(app) {
  var users = require('../controllers/users'),
      localTransactions = require('../controllers/local-transactions');

  app.route('/api/v1/local-transactions')
    .get(users.requiresToken, localTransactions.list)
    .post(users.requiresToken, localTransactions.canCreate, localTransactions.create);

  app.route('/api/v1/local-transactions/:localTransactionId')
    .get(users.requiresToken, localTransactions.hasAuthorization, localTransactions.read)
    .put(users.requiresToken, localTransactions.hasAuthorization, localTransactions.update)
    .delete(users.requiresToken, localTransactions.hasAuthorization, localTransactions.delete);

  app.param('localTransactionId', localTransactions.localTransactionById);
};