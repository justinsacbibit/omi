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

  Router.route('/token')
  .post(authHandlers.login)
  .delete(token, authHandlers.logout);

  Router.route('/userInfo')
  .get(token, userHandlers.userInfo);

  Router.route('/users/:facebook_id')
  .get(token, userHandlers.user);

  Router.route('/users/:facebook_id/friends')
  .get([token, ownership], userHandlers.friends);

  Router.route('/users/:facebook_id/owers')
  .get([token, ownership], userHandlers.owers)
  .post([token, ownership], userHandlers.newOwer);

  Router.route('/users/:facebook_id/owers/:ower_id')
  .get([token, ownership], userHandlers.ower)
  .put([token, ownership], userHandlers.putOwer) // TODO, used for converting a local ower into a facebook ower
  .delete([token, ownership], userHandlers.removeOwer);

  Router.route('/omis')
  .get(token, omiHandlers.omis) // TODO
  .post(token, omiHandlers.newOmi); // TODO

  Router.route('/omis/:omi_id')
  .get(token, omiHandlers.omi) // TODO
  .put(token, omiHandlers.putOmi) // TODO, used for confirming omis?
  .delete(token, omiHandlers.removeOmi); // TODO
};

exports.use = function(Router, passport, ownership, token) {
  routes(Router, passport, ownership, token);
  return Router;
};
