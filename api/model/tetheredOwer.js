var mongoose = require('mongoose')
  , extend   = require('mongoose-schema-extend')
  , Schema   = mongoose.Schema
  , Ower     = require('./ower.js').Ower;

var TetheredOwer = Ower.extend({
  user: {
    type:     Schema.Types.ObjectId,
    ref:      'Ower',
    required: true
  }
});

var TetheredOwerModel = mongoose.model('TetheredOwer', TetheredOwer);

exports.TetheredOwerModel = TetheredOwerModel;
