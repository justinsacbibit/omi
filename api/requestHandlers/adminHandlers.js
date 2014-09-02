var passport    = require('passport')
  , ClientModel = require('../model/auth/client.js').ClientModel
  , UserModel   = require('../model/people/user.js').UserModel;

var getClients = function() {
  return function(req, res) {
    ClientModel.find(function(err, clients) {
      if (err) {
        return res.status(500).json({
          error: err.message
        });
      }

      return res.json(clients);
    });
  };
};

var newClient = function() {
  return function(req, res) {
    ClientModel.findOne({
      clientId: req.body['id']
    }, function(err, client) {
      if (err) {
        return res.status(500).json({
          error: err.message
        });
      }

      if (client) {
        return res.status(409).json({
          error: 'Client already exists'
        });
      }

      client = new ClientModel({
        name:         req.body['name'],
        clientId:     req.body['id'],
        clientSecret: req.body['secret']
      });

      client.save(function(err) {
        if (err) {
          return res.status(500).json({
            error: err.message
          });
        }

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
        return res.status(500).json({
          error: err.message
        });
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
