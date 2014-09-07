var OwerRequestModel = require('../models/requests/owerRequest.js')
  , error            = require('../utils/error.js');

var allOwerRequests = function(req, res) {
  var type       = req.query.type
    , conditions = {};
  var facebookId;

  if (req.user && req.user.facebookId) {
    facebookId = req.user.facebookId;
  }

  if (type && facebookId) {
    if (type === 'received') {
      conditions.to = facebookId;
    } else if (type === 'sent') {
      conditions.from = facebookId;
    } else {
      return error.badRequest(res, 'Invalid parameter: type must be either "received" or "sent"');
    }
  }

  OwerRequestModel.findAsync(conditions)
  .then(function(owerRequests) {
    res.json(owerRequests);
  })
  .catch(error.serverHandler(res));
};

exports.owers = {
  all: allOwerRequests
};
