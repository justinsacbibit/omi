var ClientModel   = require('../models/auth/client.js').ClientModel
  , error         = require('../utils/error.js')
  , debug         = require('../utils/debug.js')
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
  var name =         req.body['name']
    , clientId =     req.body['id']
    , clientSecret = req.body['secret'];

  ClientModel.findOneAsync({
    clientId: clientId
  })
  .then(function(client) {
    if (client) {
      throw new ExistsError('Client already exists');
    }

    client = new ClientModel({
      name:         name,
      clientId:     clientId,
      clientSecret: clientSecret
    });

    return client.saveAsync();
  })
  .spread(function(client, numAffected) {
    debug.log(client)
    res.status(201).json({
      name:      client.name,
      client_id: client.clientId
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
