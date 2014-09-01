var mongoose    = require('mongoose')
  , extend      = require('mongoose-schema-extend')
  , Schema      = mongoose.Schema
  , Transaction = require('./transaction.js').Transaction;

var Payment = Transaction.extend({
  to: {
    type:     Schema.Types.ObjectId,
    ref:      'Ower',
    required: true
  }
});

var PaymentModel = mongoose.model('Payment', Payment);

exports.PaymentModel = PaymentModel;
