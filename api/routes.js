// Routes
var admin = require('./routes/admin.js')
  , owers = require('./routes/owers.js')
  , users = require('./routes/users.js')
  , omis  = require('./routes/omis.js');

var use = function(Router, isValidToken, isFbAuthorized) {
  route(Router, isValidToken, isFbAuthorized);
  return Router;
};

var route = function(Router, isValidToken, isFbAuthorized) {
  admin(Router);
  users(Router, isValidToken, isFbAuthorized);
  owers(Router, isFbAuthorized);
};

exports.use = use;
