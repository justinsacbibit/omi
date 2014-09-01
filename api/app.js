// Models
var TransactionModel  = require('./model/transaction.js').TransactionModel
  , GroupOmiModel     = require('./model/groupOmi.js').GroupOmiModel
  , OmiModel          = require('./model/omi.js').OmiModel
  , OwerModel         = require('./model/ower.js').OwerModel
  , PaymentModel      = require('./model/payment.js').PaymentModel
  , TetheredOwerModel = require('./model/tetheredOwer.js').TetheredOwerModel
  , UserModel         = require('./model/user.js').UserModel;

var db         = require('./db.js')
  , mongoURI   = process.env.MONGOHQ_URL || 'mongodb://localhost:27017';

var middleware = require('./middleware.js')
  , handlers   = require('./handlers.js');

exports.use = function(express, app, mongoose, nodemailer) {
  db.init(mongoose, mongoURI);

  app.all('/api/*', middleware.apikey());
  app.use('/api/v1', handlers.use(express.Router()));
  app.use(middleware.notFound());
}
