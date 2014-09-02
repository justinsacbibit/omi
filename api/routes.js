var adminHandlers = require('./requestHandlers/adminHandlers.js')
  , authHandlers  = require('./requestHandlers/authHandlers.js')
  , userHandlers  = require('./requestHandlers/userHandlers.js')
  , omiHandlers   = require('./requestHandlers/omiHandlers.js');

var routes = function(Router, passport, ownership) {
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

  // All endpoints require an access token
  var token = passport.authenticate('bearer', {
    session: false
  });

  // Login / logout endpoints
  Router.route('/token')
  .post(authHandlers.login)
  .delete(token, authHandlers.logout);

  Router.route('/userInfo')
  .get(token, function(req, res) {
    res.json({
      facebook_id: req.user.facebookId,
      name:        req.user.name
    });
  });

  Router.route('/users/:facebook_id')
  .get(token, userHandlers.user);

  Router.route('/users/:facebook_id/friends')
  .get(token, userHandlers.friends);

  Router.route('/users/:facebook_id/owers')
  .get(token, userHandlers.owers)
  .post([token, ownership], userHandlers.newOwer);

  Router.route('/users/:facebook_id/owers/:ower_id')
  .get(token, userHandlers.ower)
  .put([token, ownership], userHandlers.editOwer)
  .delete([token, ownership], userHandlers.removeOwer);

  Router.route('/omis')
  .get(token, omiHandlers.omis)
  .post(token, omiHandlers.newOmi);

  Router.route('/omis/:omi_id')
  .get(token, omiHandlers.omi)
  .put(token, omiHandlers.editOmi)
  .delete(token, omiHandlers.removeOmi);
};

exports.use = function(Router, passport, ownership) {
  routes(Router, passport, ownership);
  return Router;
};
