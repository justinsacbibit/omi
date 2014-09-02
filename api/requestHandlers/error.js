var messageJSON = function(message) {
  return {
    error: {
      message: message
    }
  };
};

var respond = function(code, message, res) {
  return res.status(code).json(messageJSON(message));
};

exports.server = function(res) {
  return respond(500, 'Server error', res);
};

exports.badRequest = function(messageStr, res) {
  return respond(400, messageStr, res);
}

exports.missingParam = function(param, res) {
  return respond(400, 'Missing required parameter: ' + param, res);
};

exports.exists = function(resource, res) {
  return respond(409, resource + ' already exists', res);
};

exports.notFound = function(resource, res) {
  return respond(404, resource + ' not found', res);
}

// 401 is an authentication error, 403 is an authorization error
exports.unauthorized = function(messageStr, res) {
  return respond(401, messageStr, res);
}

exports.gateway = function(messageStr, res) {
  return respond(502, messageStr, res);
}

exports.builder = function(moduleName, functionName, params, message) {
  var errorString = moduleName + 'Handlers.js: ' + functionName;
  errorString += ': ' + message;
  return errorString;
}
