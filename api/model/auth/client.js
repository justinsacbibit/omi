var mongoose = require('mongoose')
  , Schema   = mongoose.Schema;

var Client = new Schema({
  name: {
    type:     String,
    unique:   true,
    required: true
  },
  clientId: {
    type:     String,
    unique:   true,
    required: true
  },
  clientSecret: {
    type:     String,
    required: true
  }
});

var ClientModel = mongoose.model('Client', Client);

exports.ClientModel = ClientModel;

// var client = new ClientModel({
//   name:         'Postman',
//   clientId:     'webtest',
//   clientSecret: 'keyboard cat'
// });
//
// client.save(function(err) {
//   if (err) {
//     return console.log('error created client: ' + err.message)
//   }
//
//   return console.log('sucessful')
// })
