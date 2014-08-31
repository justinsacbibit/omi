var mongoose = require('mongoose')
  , extend   = require('mongoose-schema-extend')
  , Schema   = mongoose.Schema
  , BaseOmi  = require('./baseOmi.js').BaseOmi;

var Omi = BaseOmi.extend({
  ower: {
    type:     Schema.Types.ObjectId,
    ref:      'Ower',
    required: true
  }
});

var OmiModel = mongoose.model('Omi', Omi);

exports.Omi = Omi;
exports.OmiModel = OmiModel;
