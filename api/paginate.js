var error = require('./requestHandlers/error.js');

module.exports = function(req, res, conditions) {
  var offset = req.query.offset
    , limit  = req.query.limit;

  if (offset < 0) {
    error.badRequest(res, 'Offset parameter must be greater than or equal to zero');
    return false;
  }

  if (limit <= 0) {
    error.badRequest(res, 'Limit parameter must be greater than zero');
    return false;
  } else if (limit > 100) {
    limit = 100;
  }

  if (offset) {
    if (!limit) {
      error.missingParam(res, 'limit');
      return false;
    }

    conditions['skip'] = offset;
  } else if (limit) {
    error.missingParam(res, 'skip');
    return false;
  }

  return true;
};
