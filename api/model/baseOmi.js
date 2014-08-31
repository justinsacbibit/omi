var mongoose = require('mongoose')
  , Schema   = mongoose.Schema;

var BaseOmi = new Schema({
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
    owner: {
      type:     Schema.Types.ObjectId,
      ref:      'Ower',
      required: true
    },
    created: {
      type:    Date,
      default: Date.now
    }
}, {
  discriminatorKey: '_type'
});

exports.BaseOmi = BaseOmi;
