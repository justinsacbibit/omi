var mongoose = require('mongoose')
  , Schema   = mongoose.Schema;

var Payment = new Schema({
  amount: {
    type:     Number,
    required: true
  },
  note: {
    type: String
  },
  from: {
    type:     Schema.Types.ObjectId,
    ref:      'Ower',
    required: true
  },
  to: {
    type:     Schema.Types.ObjectId,
    ref:      'Ower',
    required: true
  }
});

var PaymentModel = mongoose.model('Payment', Payment);

exports.PaymentModel = PaymentModel;
