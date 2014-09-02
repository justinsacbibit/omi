var errorJSON = function(message, code) {
  var JSON = {
    error: {
      message: message
    }
  };

  if (code && code > 0) {
    JSON['error']['code'] = code;
  }

  return JSON;
}

var builder = function(moduleName, functionName, message, error) {
  var errorString = moduleName + 'Handlers.js: ' + functionName;
  errorString += ': ' + message;
  errorString += ', error: ' + error;
  return errorString;
};

var respond = function(res, statusCode, message, errorCode) {
  return res.status(statusCode).json(errorJSON(message, errorCode));
};

exports.server = function(res, errorCode) {
  return respond(res, 500, 'Server error', errorCode);
};

exports.badRequest = function(res, messageStr, errorCode) {
  return respond(res, 400, messageStr, errorCode);
};

exports.missingParam = function(res, param, errorCode) {
  return respond(res, 400, 'Missing required parameter: ' + param, errorCode);
};

exports.exists = function(res, resource, errorCode) {
  return respond(res, 409, resource + ' already exists', errorCode);
};

exports.notFound = function(res, resource, errorCode) {
  return respond(res, 404, resource + ' not found', errorCode);
};

// 401 is an authentication error, 403 is an authorization error
exports.unauthorized = function(res, messageStr, errorCode) {
  return respond(res, 401, messageStr, errorCode);
};

exports.forbidden = function(res, errorCode) {
  return respond(res, 403, 'You are not authorized to access this resource', errorCode);
};

exports.notImplemented = function(res) {
  return respond(res, 501, 'Endpoint not implemented');
};

exports.gateway = function(res, messageStr, errorCode) {
  return respond(res, 502, messageStr, errorCode);
};

exports.log = function(moduleName, functionName, failure, error) {
  console.log(builder(moduleName, functionName, failure + ' failed', error));
};
