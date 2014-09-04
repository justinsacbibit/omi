var mongoose = require('mongoose')
  , Schema   = mongoose.Schema;

var FBToken = new Schema({
  facebookId: {
    type:     String,
    required: true
  },
  token: {
    type:     String,
    unique:   true
  },
  scopes: {
    type:     [String],
    required: true
  },
  expires: {
    type:     Date,
    required: true
  }
});

var FBTokenModel = mongoose.model('FBToken', FBToken);

exports.FBToken      = FBToken;
exports.FBTokenModel = FBTokenModel;
