var mongoose = require('mongoose')
  , Schema   = mongoose.Schema
  , extend   = require('mongoose-schema-extend')
  , Ower     = require('./ower.js').Ower;

var User = Ower.extend({
  facebookId: {
    type:     Number,
    required: true,
    unique:   true
  },
  email: {
    type:     String,
    unique:   true
  }
});

var UserModel = mongoose.model('User', User);

exports.UserModel = UserModel;

// var user = new UserModel({
//   name: 'Justin Sacbibit',
//   facebookId: 8347013472
// })
//
// user.save(function(err) {
//   if (err) {
//     return console.log('error creating user: ' + err.message);
//   }
//
//   return console.log('successful');
// })
