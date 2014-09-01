var mongoose = require('mongoose')
  , extend   = require('mongoose-schema-extend')
  , Schema   = mongoose.Schema
  , Transaction  = require('./transaction.js').Transaction;

var Omi = Transaction.extend({
  ower: {
    type:     Schema.Types.ObjectId,
    ref:      'Ower',
    required: true
  }
});

var OmiModel = mongoose.model('Omi', Omi);

exports.Omi = Omi;
exports.OmiModel = OmiModel;
