var ClientModel   = require('../models/auth/client.js').ClientModel
  , error         = require('../utils/error.js')
  , ClientErrors  = require('../models/errors/client.js')
  , NotFoundError = ClientErrors.NotFoundError
  , ExistsError   = ClientErrors.ExistsError;

exports.all = function(req, res) {
  return ClientModel.findAsync()
  .then(function(clients) {
    return res.json(clients);
  })
  .catch(error.serverHandler(res));
};

exports.create = function(req, res) {
  var name =         req.param('name')
    , clientId =     req.param('id')
    , clientSecret = req.param('secret');

  ClientModel.findOneAsync({
    clientId: clientId
  })
  .then(function(client) {
    if (client) {
      throw new ExistsError('Client already exists');
    }

    client = new ClientModel({
      name:         req.body['name'],
      clientId:     req.body['id'],
      clientSecret: req.body['secret']
    });

    return client.saveAsync();
  })
  .then(function(client) {
    console.log(client)
    res.status(201).json({
      name:     client.name,
      clientId: client.clientId
    });
  })
  .catch(ExistsError, error.existsHandler(res))
  .catch(error.serverHandler(res));
};

exports.show = function(req, res) {
  var clientId = req.param('client_id');

  ClientModel.findOneAsync({
    clientId: clientId
  })
  .then(function(client) {
    if (!client) {
      throw new NotFoundError('Client not found');
    }

    res.json(client);
  })
  .catch(NotFoundError, error.notFoundHandler(res))
  .catch(error.serverHandler(res));
};

exports.delete = function(req, res) {
  var clientId = req.param('client_id');

  ClientModel.findOneAndRemoveAsync({
    clientId: clientId
  })
  .then(function(client) {
    if (!client) {
      throw new NotFoundError('Client not found');
    }

    res.json({
      success: true
    });
  })
  .catch(NotFoundError, error.notFoundHandler(res))
  .catch(error.serverHandler(res));
};
