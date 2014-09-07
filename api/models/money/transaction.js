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
      default: false
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

Transaction.methods.toJSON = function() {
  var obj = this.toObject();
  if (!process.env.DEBUG) {
    delete obj.__v;
  }
  return obj;
}

var TransactionModel = mongoose.model('Transaction', Transaction);

exports.TransactionModel = TransactionModel;
