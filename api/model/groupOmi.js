var mongoose = require('mongoose')
  , extend   = require('mongoose-schema-extend')
  , Schema   = mongoose.Schema
  , BaseOmi  = require('./baseOmi.js').BaseOmi
  , Omi      = require('./omi.js').Omi;

var GroupOmi = BaseOmi.extend({
  omis: {
    type:     [Schema.Types.ObjectId],
    ref:      'Omi',
    required: true
  }
});

var GroupOmiModel = mongoose.model('GroupOmi', GroupOmi);

exports.GroupOmiModel = GroupOmiModel;
