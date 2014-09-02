var adminHandlers = require('./requestHandlers/adminHandlers.js')
  , authHandlers  = require('./requestHandlers/authHandlers.js');

var routes = function(Router, passport) {
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

  // Login / logout endpoints
  Router.route('/token')
  .post(authHandlers.login)
  .delete(authHandlers.logout);

  // All endpoints require an access token
  var token = passport.authenticate('bearer', {
    session: false
  });

  Router.route('/userInfo')
  .get(token, function(req, res) {
    res.json({
      facebook_id: req.user.facebookId,
      name: req.user.name
    });
  });

  // Router.route('/users')
  // .
};

exports.use = function(Router, passport) {
  routes(Router, passport);
  return Router;
};
