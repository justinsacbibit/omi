var mongoose = require('mongoose')
  , Schema   = mongoose.Schema;

var OmiRequest = new Schema({
  created: {
    type:    Date,
    default: Date.now
  },
  from: {
    type:     Schema.Types.ObjectId,
    required: true
  },
  to: {
    type:     Schema.Types.ObjectId,
    required: true
  },
  omi: {
    type:     Schema.Types.ObjectId,
    ref:      'Omi',
    required: true
  }
});

var OmiRequestModel = mongoose.model('OmiRequest', OmiRequest);

exports.OmiRequestModel = OmiRequestModel;
