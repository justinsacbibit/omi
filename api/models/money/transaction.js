var mongoose = require('mongoose')
  , Schema   = mongoose.Schema;

var Transaction = new Schema({
    name: {
      type:     String,
      required: true
    },
    amount: {
      type:     Number,
      required: true
    },
    note: {
      type: String
    },
    from: {
      type:     Schema.Types.ObjectId,
      required: true
    },
    to: {
      type:     Schema.Types.ObjectId,
      required: true
    },
    created: {
      type:    Date,
      default: Date.now
    },
    confirmed: {
      type:    Boolean,
      default: true
    },
    type: {
      type:     String,
      enum:     ['omi', 'payment'],
      required: true
    },
    groupOmi: {
      type: Schema.Types.ObjectId,
      ref:  'GroupOmi'
    }
});

Transaction.path('amount').validate(function(v) {
  return v >= 0.01;
});

Transaction.path('from').validate(function(v) {
  return !this.to.equals(v);
}, 'ServerError');

Transaction.methods.toJSON = function() {
  var obj = this.toObject();
  if (!process.env.DEBUG) {
    delete obj.__v;
  }
  return obj;
}

var TransactionModel = mongoose.model('Transaction', Transaction);

exports.TransactionModel = TransactionModel;
