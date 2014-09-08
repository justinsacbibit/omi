var owers = require('../controllers/owers.js');

module.exports = function(Router, isFbAuthorized) {
  Router.route('/users/:facebook_id/owers')
    .get(isFbAuthorized, owers.all)
    .post(isFbAuthorized, owers.create);

  Router.route('/users/:facebook_id/owers/:ower_id')
    .get(isFbAuthorized, owers.show)
    .put(isFbAuthorized, owers.update)

  /**
   * TODO: Transactions for the tethered ower should be removed, balances updated
   */
    .delete(isFbAuthorized, owers.delete);
};
