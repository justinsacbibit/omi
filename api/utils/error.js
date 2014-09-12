var debug = require('./debug.js');

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

var respond = function(res, statusCode, message, errorCode) {
  return res.status(statusCode).json(errorJSON(message, errorCode));
};

var server = exports.server = function(res, message) {
  return respond(res, 500, message ? message : 'Server error', 100);
};

var badRequest = exports.badRequest = function(res, message) {
  return respond(res, 400, message, 201);
};

var missingParam = exports.missingParam = function(res, message) {
  return respond(res, 400, message, 200);
};

var exists = exports.exists = function(res, message) {
  return respond(res, 409, message, 202);
};

var conflict = exports.conflict = function(res, message) {
  return respond(res, 409, message, 203);
}

var notFound = exports.notFound = function(res, message) {
  return respond(res, 404, message, 204);
};

// 401 is an authentication error, 403 is an authorization error
var unauthorized = exports.unauthorized = function(res, message) {
  return respond(res, 401, message, 300);
};

var forbidden = exports.forbidden = function(res) {
  return respond(res, 403, 'You are not authorized to access this resource', 301);
};

var notImplemented = exports.notImplemented = function(res) {
  return respond(res, 501, 'Endpoint not implemented', 101);
};

var gateway = exports.gateway = function(res, message) {
  return respond(res, 502, message, 102);
};

var log = exports.log = function(param) {
  if (typeof param == Error) {
    debug.log(param.stack);
  } else {
    debug.trace(param);
  }
};

var errorCallback = function(res, func) {
  return function(err) {
    log(err);
    // console.log(err);
    if (err && err.name === 'ValidationError') {
      badRequest(res, err.message);
    } else {
      func(res, err.message);
    }
  };
};

var serverHandler = exports.serverHandler = function(res) {
  return errorCallback(res, server);
};

var notFoundHandler = exports.notFoundHandler = function(res) {
  return errorCallback(res, notFound);
};

var existsHandler = exports.existsHandler = function(res) {
  return errorCallback(res, exists);
};

var gatewayHandler = exports.gatewayHandler = function(res) {
  return errorCallback(res, gateway);
};

var conflictHandler = exports.conflictHandler = function(res) {
  return errorCallback(res, conflict);
};

var forbiddenHandler = exports.forbiddenHandler = function(res) {
  return errorCallback(res, forbidden);
};

var badRequestHandler = exports.badRequestHandler = function(res) {
  return errorCallback(res, badRequest);
};
