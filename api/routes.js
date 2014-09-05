var adminHandlers = require('./requestHandlers/adminHandlers.js')
  , authHandlers  = require('./requestHandlers/authHandlers.js')
  , userHandlers  = require('./requestHandlers/userHandlers.js')
  , omiHandlers   = require('./requestHandlers/omiHandlers.js');

var routes = function(Router, passport, ownership, token) {
  // Admin endpoints
  // TODO: Create OSX app that uses these endpoints
  Router.route('/admin/clients')
  .get(adminHandlers.clients)
  .post(adminHandlers.newClient);

  Router.route('/admin/clients/:client_id')
  .get(adminHandlers.client)
  .delete(adminHandlers.deleteClient);

  Router.route('/admin/users')
  .get(adminHandlers.users)
  .post(adminHandlers.users);

  Router.route('/admin/owers')
  .get(adminHandlers.owers);

  Router.route('/admin/requests/owers')
  .get(adminHandlers.owerRequests);

  Router.route('/token')
  .post(authHandlers.login)
  .delete(token, authHandlers.logout);

  Router.route('/userInfo')
  .get(token, userHandlers.userInfo);

  Router.route('/users/:facebook_id')
  .get(token, userHandlers.user);

  Router.route('/users/:facebook_id/requests/owers')
  .get([token, ownership], userHandlers.owerRequests);

  Router.route('/users/:facebook_id/friends')
  .get([token, ownership], userHandlers.friends);

  Router.route('/users/:facebook_id/owers')
  .get([token, ownership], userHandlers.owers)
  .post([token, ownership], userHandlers.newOwer);

  Router.route('/users/:facebook_id/owers/:ower_id')
  .get([token, ownership], userHandlers.ower)

  .put([token, ownership], userHandlers.putOwer)

  /**
   * WIP
   * Minor: Omis for the tethered ower should be removed?
   */
  .delete([token, ownership], userHandlers.removeOwer);

  Router.route('/omis')

  /**
   * TODO
   */
  .get(token, omiHandlers.omis)

  /**
   * TODO
   */
  .post(token, omiHandlers.newOmi);

  Router.route('/omis/:omi_id')

  /**
   * TODO
   */
  .get(token, omiHandlers.omi)

  /**
   * TODO
   * @note Used for confirming omis?
  .put(token, omiHandlers.putOmi)

  /**
   * TODO
   */
  .delete(token, omiHandlers.removeOmi);
};

exports.use = function(Router, passport, ownership, token) {
  routes(Router, passport, ownership, token);
  return Router;
};
