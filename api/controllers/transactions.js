var TransactionModel = require('../models/money/transaction.js').TransactionModel
  , GroupOmiModel    = require('../models/money/groupOmi.js').GroupOmiModel
  , OmiRequestModel  = require('../models/requests/omiRequest.js').OmiRequestModel
  , error            = require('../utils/error.js')
  , paginate         = require('../utils/paginate.js');

var ClientErrors  = require('../models/errors/client.js')
  , ExistsError   = ClientErrors.ExistsError
  , NotFoundError = ClientErrors.NotFoundError;

exports.all = function(req, res) {
  var facebookId = req.param('facebook_id')
    , offset     = req.query.offset
    , limit      = req.query.limit
    , type       = req.query.type;

  var conditions = {};

  if (!paginate(req, res, conditions)) {
    return;
  }

  if (type && type !== 'omi' && type !== 'user') {
    return error.badRequest(res, 'Type must be either "omi" or "user"');
  } else if (type) {
    conditions.type = type;
  }

  if (facebookId) {
    conditions['$or'] = [
      {
        from: facebookId
      },
      {
        to: facebookId
      }
    ];
  }

  TransactionModel.findAsync(conditions)
  .then(function(transactions) {
    res.json(transactions);
  })
  .catch(error.serverHandler(res));
};

exports.create = function(req, res) {
  return error.notImplemented(res);
};

exports.show = function(req, res) {
  return error.notImplemented(res);
};

exports.update = function(req, res) {
  return error.notImplemented(res);
};

exports.delete = function(req, res) {
  return error.notImplemented(res);
};
