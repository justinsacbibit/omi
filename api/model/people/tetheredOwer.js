var mongoose = require('mongoose')
  , extend   = require('mongoose-schema-extend')
  , Schema   = mongoose.Schema
  , Ower     = require('./ower.js').Ower;

var TetheredOwer = Ower.extend({
  tetheredTo: {
    type:     Number, // facebook ID
    required: true
  },
  counterpart: {
    type: Schema.Types.ObjectId,
    ref:  'TetheredOwer'
  }
});

TetheredOwer.methods.toJSON = function() {
  var obj = this.toObject();
  if (!process.env.DEBUG) {
    delete obj.__v;
  }
  return obj;
}

var TetheredOwerModel = mongoose.model('TetheredOwer', TetheredOwer, 'owers');

exports.TetheredOwerModel = TetheredOwerModel;
