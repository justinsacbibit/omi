'use strict';

/**
 * Module dependencies.
 */
var users = require('../controllers/users'),
    owers = require('../controllers/owers');

module.exports = function(app) {
  app.route('/api/v1/owers')
    .get(users.requiresToken, owers.list)
    .post(users.requiresToken, owers.cannotModifyBalance, owers.create);

  app.route('/api/v1/owers/:owerId')
    .get(users.requiresToken, owers.hasAuthorization, owers.read)
    .put(users.requiresToken, owers.hasAuthorization, owers.cannotModifyBalance, owers.update)
    .delete(users.requiresToken, owers.hasAuthorization, owers.delete);

  app.route('/owers')
    .get(users.requiresLogin, owers.list)
    .post(users.requiresLogin, owers.create);

  app.route('/owers/:owerId')
    .get(users.requiresLogin, owers.hasAuthorization, owers.read)
    .put(users.requiresLogin, owers.hasAuthorization, owers.update)
    .delete(users.requiresLogin, owers.hasAuthorization, owers.delete);

  app.param('owerId', owers.owerById);
};