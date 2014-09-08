var transactions = require('../controllers/transactions.js');

module.exports = function(Router, isFbAuthorized) {
  Router.route('/users/:facebook_id/transactions')
    .get(isFbAuthorized, transactions.all)
    .post(isFbAuthorized, transactions.create);

  Router.route('/users/:facebook_id/transactions/:transaction_id')
    .get(isFbAuthorized, transactions.show)

  /**
   * TODO: Use for unconfirming/confirming omis
   */
    .put(isFbAuthorized, transactions.update)
    .delete(isFbAuthorized, transactions.delete);
};
