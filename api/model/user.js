var mongoose = require('mongoose')
  , Schema   = mongoose.Schema
  , extend   = require('mongoose-schema-extend')
  , Ower     = require('./ower.js').Ower;

var User = Ower.extend({
  facebookId: {
    type:     Number,
    required: true
  },
  email: {
    type:     String,
    required: true
  }
});

var UserModel = mongoose.model('User', User);

exports.UserModel = UserModel;
