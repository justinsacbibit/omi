var passport    = require('passport')
  , ClientModel = require('../model/auth/client.js').ClientModel
  , UserModel   = require('../model/people/user.js').UserModel
  , error       = require('./error.js');

var logError = function(functionName, failure, err) {
  error.log('admin', functionName, failure, err);
};

var admin = function(req, res, next) {
    var clientId
      , clientSecret;

    if (req.headers && req.headers['x-client-id']) {
      if (!req.headers['x-client-secret']) {
        return error.missingParam(res, 'x-client-secret');
      }

      clientId     = req.headers['x-client-id'];
      clientSecret = req.headers['x-client-secret'];
    }

    if (req.body && req.body['client_id']) {
      if (!req.body['client_secret']) {
        return error.missingParam(res, 'client_secret');
      }

      if (clientId || clientSecret) {
        return error.badRequest(res, 'Multiple client credentials found in request');
      }

      clientId     = req.body['client_id'];
      clientSecret = req.body['client_secret'];
    }

    if (req.query && req.query['client_id']) {
      if (!req.query['client_secret']) {
        return error.missingParam(res, 'client_secret');
      }

      if (clientId || clientSecret) {
        return error.badRequest(res, 'Multiple client credentials found in request');
      }

      clientId     = req.query['client_id'];
      clientSecret = req.query['client_secret'];
    }

    if (!clientId) {
      return error.missingParam(res, 'Missing client ID in request');
    }

    if (clientId !== process.env.ADMIN_ID) {
      return error.forbidden(res);
    }

    ClientModel.findOne({
      clientId: clientId
    }, function(err, client) {
      if (err) {
        logError('admin', 'ClientModel.findOne', err);
        return error.server(res);
      }

      var checkClient = function() {
        if (client.clientSecret != clientSecret) {
          return error.unauthorized(res, 'Invalid client secret');
        }

        return next();
      }

      if (!client) {
        client = new ClientModel({
          name:        'Admin',
          clientId:     process.env.ADMIN_ID,
          clientSecret: process.env.ADMIN_SECRET
        });

        return client.save(function(err) {
          if (err) {
            logError('admin', 'ClientModel.save', err);
            return error.server(res);
          }

          return checkClient();
        });
      }

      return checkClient();
    });
};

var getClients = function() {
  return function(req, res) {
    ClientModel.find(function(err, clients) {
      if (err) {
        console.log('adminHandlers.js: getClients(): Error retrieving all clients: ' + err);
        return error.server(res);
      }

      return res.json(clients);
    });
  };
};

var deleteClient = function() {
  return function(req, res) {
    var clientId = req.param('client_id');

    ClientModel.find({
      clientId: clientId
    }).remove(function(err) {
      if (err) {
        logError('deleteClient', 'ClientModel.remove', err);
        return error.server(res);
      }

      return res.json({
        success: true
      });
    });
  };
};

var newClient = function() {
  return function(req, res) {
    var name         = req.body['name']
      , clientId     = req.body['id']
      , clientSecret = req.body['secret'];

    if (!name) {
      return error.missingParam(res, 'name');
    } else if (!clientId) {
      return error.missingParam(res, 'id');
    } else if (!clientSecret) {
      return error.missingParam(res, 'secret');
    }

    ClientModel.findOne({
      clientId: clientId
    }, function(err, client) {
      if (err) {
        console.log('adminHandlers.js: newClient(): Error finding client with ID: ' + clientId + ', error: ' + err);
        return error.server(res);
      }

      if (client) {
        return error.exists(res, 'Client');
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
  admin,
  getClients()
];

exports.newClient = [
  admin,
  newClient()
];

exports.client = [
  admin,
  getClients()
];

exports.deleteClient = [
  admin,
  deleteClient()
];

exports.users = [
  admin,
  getUsers()
];
