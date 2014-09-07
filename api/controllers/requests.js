var error = require('../utils/error.js');

var allOwerRequests = function(req, res) {
  return error.notImplemented(res);
};

exports.owers = {
  all: allOwerRequests
};
