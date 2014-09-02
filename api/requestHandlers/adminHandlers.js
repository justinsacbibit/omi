var passport    = require('passport')
  , ClientModel = require('../model/auth/client.js').ClientModel
  , UserModel   = require('../model/people/user.js').UserModel
  , error       = require('./error.js');

var getClients = function() {
  return function(req, res) {
    ClientModel.find(function(err, clients) {
      if (err) {
        console.log('adminHandlers.js: getClients(): Error retrieving all clients: ' + err)
        return res.status(500).json(error.server);
      }

      return res.json(clients);
    });
  };
};

var newClient = function() {
  return function(req, res) {
    var name         = req.body['name']
      , clientId     = req.body['id']
      , clientSecret = req.body['secret'];

    if (!name) {
      return error.missingParam('name', res);
    } else if (!clientId) {
      return error.missingParam('id', res);
    } else if (!clientSecret) {
      return error.missingParam('secret', res);
    }

    ClientModel.findOne({
      clientId: clientId
    }, function(err, client) {
      if (err) {
        console.log('adminHandlers.js: newClient(): Error finding client with ID: ' + clientId + ', error: ' + err);
        return error.server(res);
      }

      if (client) {
        return error.exists('Client', res);
      }

      client = new ClientModel({
        name:         req.body['name'],
        clientId:     req.body['id'],
        clientSecret: req.body['secret']
      });

      client.save(function(err) {
        if (err) {
          console.log('adminHandlers.js: newClient(): Error saving client with ID: ' + clientId + ', error: ' + err);
          return error.server(res);
        }

        console.log('adminHandlers.js: newClient(): Successfully crated new client: ' + client);
        return res.status(201).json({
          name:     client.name,
          clientId: client.clientId
        });
      });
    });
  };
};

var getUsers = function() {
  return function(req, res) {
    UserModel.find(function(err, users) {
      if (err) {
        console.log('adminHandlers.js: getUsers(): Error finding users: ' + err);
        return error.server(res);
      }

      return res.json(users);
    });
  };
};

exports.clients = [
  passport.authenticate(['oauth2-client-password'], {
    session: false
  }),
  getClients()
];

exports.newClient = [
  passport.authenticate(['oauth2-client-password'], {
    session: false
  }),
  newClient()
];

exports.client = [
  passport.authenticate(['oauth2-client-password'], {
    session: false
  }),
  getClients()
];

exports.deleteClient = [
  passport.authenticate(['oauth2-client-password'], {
    session: false
  }),
  getClients()
];

exports.users = [
  passport.authenticate(['oauth2-client-password'], {
    session: false
  }),
  getUsers()
];
