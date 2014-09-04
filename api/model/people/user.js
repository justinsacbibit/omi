var mongoose = require('mongoose')
  , Schema   = mongoose.Schema
  , extend   = require('mongoose-schema-extend')
  , Ower     = require('./ower.js').Ower
  , FBToken  = require('../auth/fbToken.js').FBToken;

var User = Ower.extend({
  email: {
    type: String
  },
  fbToken: {
    type: [FBToken]
  }
});

User.methods.toJSON = function() {
  var obj = this.toObject();
  if (!process.env.DEBUG) {
    delete obj.__v;
  }
  delete obj.fbToken;
  return obj;
}

var UserModel = mongoose.model('User', User, 'owers');

exports.UserModel = UserModel;
