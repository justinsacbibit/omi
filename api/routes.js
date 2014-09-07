// Routes
var admin        = require('./routes/admin.js')
  , owers        = require('./routes/owers.js')
  , users        = require('./routes/users.js')
  , transactions = require('./routes/transactions.js');

var use = function(Router, isValidToken, isFbAuthorized) {
  route(Router, isValidToken, isFbAuthorized);
  return Router;
};

var route = function(Router, isValidToken, isFbAuthorized) {
  admin(Router);
  users(Router, isValidToken, isFbAuthorized);
  owers(Router, isFbAuthorized);
  transactions(Router, isFbAuthorized);
};

exports.use = use;
