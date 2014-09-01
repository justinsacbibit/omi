// Models
var TransactionModel  = require('./model/money/transaction.js').TransactionModel
  , GroupOmiModel     = require('./model/money/groupOmi.js').GroupOmiModel
  , OmiModel          = require('./model/money/omi.js').OmiModel
  , OwerModel         = require('./model/people/ower.js').OwerModel
  , PaymentModel      = require('./model/money/payment.js').PaymentModel
  , TetheredOwerModel = require('./model/people/tetheredOwer.js').TetheredOwerModel
  , UserModel         = require('./model/people/user.js').UserModel;

var adminHandlers = require('./requestHandlers/adminHandlers.js');

var routes = function(Router, passport, oauth2) {
  Router.route('/admin/oauth/client')
  .get(adminHandlers.clients)
  .post(adminHandlers.newClient);

  Router.route('/admin/oauth/client/:client_id')
  .get(adminHandlers.client)
  .delete(adminHandlers.deleteClient);

  Router.route('/oauth/token')
  .post(oauth2.token);

  Router.route('/userInfo')
  .get(passport.authenticate('bearer', {
    session: false
  }), function(req, res) {
    res.json({
      facebook_id: req.user.facebookId,
      name: req.user.name,
      scope: req.authInfo.scope
    });
  });
};

exports.use = function(Router, passport, oauth2) {
  routes(Router, passport, oauth2);
  return Router;
};
