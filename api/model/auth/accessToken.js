var mongoose = require('mongoose')
  , Schema   = mongoose.Schema;

var AccessToken = new Schema({
  facebookId: {
    type:     String,
    required: true
  },
  clientId: {
    type:     String,
    required: true
  },
  token: {
    type:     String,
    unique:   true,
    required: true
  },
  created: {
    type:    Date,
    default: Date.now
  }
});

var AccessTokenModel = mongoose.model('AccessToken', AccessToken);

exports.AccessTokenModel = AccessTokenModel;
