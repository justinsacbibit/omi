var transactions = require('../controllers/transactions.js');

module.exports = function(Router, isFbAuthorized) {
  Router.route('/users/:facebook_id/transactions')

  /**
   * TODO
   */
    .get(isFbAuthorized, transactions.all)

  /**
   * TODO
   */
    .post(isFbAuthorized, transactions.create);

  Router.route('/users/:facebook_id/transactions/:transaction_id')

  /**
   * TODO
   */
    .get(isFbAuthorized, transactions.show)

  /**
   * TODO
   * @note Used for confirming omis?
   */
    .put(isFbAuthorized, transactions.update)

  /**
   * TODO
   */
    .delete(isFbAuthorized, transactions.delete);
};
