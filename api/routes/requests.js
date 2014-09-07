var requests   = require('../controllers/requests.js')
  , middleware = require('../utils/middleware.js');

var validFacebookId = middleware.validFacebookId
  , isOwnFacebookId = middleware.validFacebookId;

module.exports = function(Router, isValidToken) {
  Router.route('/users/:facebook_id/requests/owers')
    .get([isValidToken, validFacebookId, isOwnFacebookId], requests.owers);
};
