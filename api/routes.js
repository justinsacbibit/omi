var adminHandlers = require('./requestHandlers/adminHandlers.js')
  , authHandlers  = require('./requestHandlers/authHandlers.js');

var routes = function(Router, passport) {
  Router.route('/admin/clients')
  .get(adminHandlers.clients)
  .post(adminHandlers.newClient);

  Router.route('/admin/clients/:client_id')
  .get(adminHandlers.client)
  .delete(adminHandlers.deleteClient);

  Router.route('/admin/users')
  .get(adminHandlers.users)
  .post(adminHandlers.users);

  Router.route('/token')
  .post(authHandlers.login)
  .delete(authHandlers.logout);

  Router.route('/userInfo')
  .get(passport.authenticate('bearer', {
    session: false
  }), function(req, res) {
    res.json({
      facebook_id: req.user.facebookId,
      name: req.user.name,
      scope: req.authInfo.scope
    });
  });
};

exports.use = function(Router, passport) {
  routes(Router, passport);
  return Router;
};
