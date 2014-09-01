var mongoose    = require('mongoose')
  , extend      = require('mongoose-schema-extend')
  , Schema      = mongoose.Schema
  , Transaction = require('./transaction.js').Transaction
  , Omi         = require('./omi.js').Omi;

var GroupOmi = Transaction.extend({
  omis: {
    type:     [Schema.Types.ObjectId],
    ref:      'Omi',
    required: true
  }
});

var GroupOmiModel = mongoose.model('GroupOmi', GroupOmi);

exports.GroupOmiModel = GroupOmiModel;
