var mongoose    = require('mongoose')
  , Schema      = mongoose.Schema;

var GroupOmi = new Schema({
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
    ref:      'Ower',
    required: true
  },
  created: {
    type:    Date,
    default: Date.now
  },
  omis: [{
    type:     Schema.Types.ObjectId,
    ref:      'Transaction',
    required: true
  }]
});

var GroupOmiModel = mongoose.model('GroupOmi', GroupOmi);

exports.GroupOmiModel = GroupOmiModel;
