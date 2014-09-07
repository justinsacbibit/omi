var mongoose = require('mongoose')
  , Schema   = mongoose.Schema
  , FBToken  = require('../auth/fbToken.js').FBToken;

var User = new Schema({
  email: {
    type: String
  },
  fbToken: {
    type: [FBToken]
  },
  created: {
    type:    Date,
    default: Date.now
  },
  name: {
    type:     String,
    required: true
  },
  facebookId: {
    type:     Number,
    required: true,
    unique:   true
  },
  type: {
    type:    String,
    default: 'user'
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

var UserModel = mongoose.model('User', User, 'people');

exports.UserModel = UserModel;
