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
  },
  tetheredTo: {
    type:     Number,
    required: true
  },
  balance: {
    type:    Number,
    default: 0
  },
  counterpart: {
    type: Schema.Types.ObjectId,
    ref:  'TetheredOwer'
  },
  type: {
    type:    String,
    default: 'ower'
  }
});

Ower.methods.toJSON = function() {
  var obj = this.toObject();
  if (!process.env.DEBUG) {
    delete obj.__v;
  }
  return obj;
};

var OwerModel = mongoose.model('Ower', Ower, 'people');

exports.Ower = Ower;
exports.OwerModel = OwerModel;
