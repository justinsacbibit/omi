var mongoose = require('mongoose')
  , Schema   = mongoose.Schema;

var OwerRequest = new Schema({
  created: {
    type:    Date,
    default: Date.now
  },
  from: {
    type:     Number,
    required: true
  },
  to: {
    type:     Number,
    required: true
  }
});

var OwerRequestModel = mongoose.model('OwerRequest', OwerRequest);

exports.OwerRequestModel = OwerRequestModel;
