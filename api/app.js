// Models
var TransactionModel      = require('./model/transaction.js').TransactionModel
  , GroupOmiModel     = require('./model/groupOmi.js').GroupOmiModel
  , OmiModel          = require('./model/omi.js').OmiModel
  , OwerModel         = require('./model/ower.js').OwerModel
  , PaymentModel      = require('./model/payment.js').PaymentModel
  , TetheredOwerModel = require('./model/tetheredOwer.js').TetheredOwerModel
  , UserModel         = require('./model/user.js').UserModel;

exports.use = function(app, mongoose, passport, nodemailer) {
  
}
