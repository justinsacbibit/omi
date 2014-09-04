var mongoose = require('mongoose')
  , Schema   = mongoose.Schema;

var Ower = new Schema({
  created: {
    type:    Date,
    default: Date.now
  },
  name: {
    type:     String,
    required: true
  },
  facebookId: {
    type: Number
  }
}, {
  discriminatorKey: '_type'
});

Ower.methods.toJSON = function() {
  var obj = this.toObject();
  if (!process.env.DEBUG) {
    delete obj.__v;
  }
  return obj;
}

var OwerModel = mongoose.model('Ower', Ower, 'owers');

exports.Ower = Ower;
exports.OwerModel = OwerModel;
