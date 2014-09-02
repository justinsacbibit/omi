var error = require('./requestHandlers/error.js');

module.exports = function(req, res, conditions) {
  var offset = req.query.offset
    , limit  = req.query.limit;

  if (!offset) {
    error.missingParam('offset', res);
    return false;
  } else if (!limit) {
    error.missingParam('limit', res);
    return false;
  }

  if (offset < 0) {
    error.badRequest('Offset parameter must be greater than or equal to zero', res);
    return false;
  }

  if (limit <= 0) {
    error.badRequest('Limit parameter must be greater than zero', res);
    return false;
  }

  conditions['skip']  = offset;
  conditions['limit'] = limit;

  return true;
};
