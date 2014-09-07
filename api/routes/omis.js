var omis = require('../controllers/omis.js');

module.exports = function(Router, isFbAuthorized) {
  Router.route('/users/:facebook_id/omis')

  /**
   * TODO
   */
    .get(isFbAuthorized, omis.all)

  /**
   * TODO
   */
    .post(isFbAuthorized, omis.create);

  Router.route('/omis/:omi_id')

  /**
   * TODO
   */
    .get(isFbAuthorized, omis.show)

  /**
   * TODO
   * @note Used for confirming omis?
   */
    .put(isFbAuthorized, omis.update)

  /**
   * TODO
   */
    .delete(isFbAuthorized, omis.delete);
};
