var clients    = require('../controllers/clients.js')
  , owers      = require('../controllers/owers.js')
  , users      = require('../controllers/users.js')
  , requests   = require('../controllers/requests.js')
  , middleware = require('../utils/middleware.js');

var isAdmin = middleware.validAdminCredentials;

module.exports = function(Router) {
  // TODO: Create OSX app that uses these endpoints
  Router.route('/admin/clients')
    .get(isAdmin, clients.all)
    .post(isAdmin, clients.create);

  Router.route('/admin/clients/:client_id')
    .get(isAdmin, clients.show)
    .delete(isAdmin, clients.delete);

  Router.route('/admin/users')
    .get(isAdmin, users.all)

  Router.route('/admin/owers')
    .get(isAdmin, owers.all);

  Router.route('/admin/requests/owers')
    .get(isAdmin, requests.owers.all);
};
