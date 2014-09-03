var mongoose = require('mongoose')
  , extend   = require('mongoose-schema-extend')
  , Schema   = mongoose.Schema
  , Ower     = require('./ower.js').Ower;

var TetheredOwer = Ower.extend({
  user: {
    type:     Number, // facebook ID
    required: true
  }
});

TetheredOwer.methods.toJSON = function() {
  var obj = this.toObject();
  delete obj.__v;
  return obj;
}

var TetheredOwerModel = mongoose.model('TetheredOwer', TetheredOwer, 'owers');

exports.TetheredOwerModel = TetheredOwerModel;
