'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	  Schema = mongoose.Schema;

/**
 * Ower Schema
 */
var OwerSchema = new Schema({
  created: {
    type: Date,
    default: Date.now
  },
  firstName: {
    type: String,
    trim: true,
    required: true
  },
  lastName: {
    type: String,
    default: ''
  },
  tetheredTo: {
    type: Schema.ObjectId,
    ref: 'User',
    required: true
  },
  balance: {
    type: Number,
    default: 0
  }
});

var OwerModel = mongoose.model('Ower', OwerSchema);

OwerSchema.path('tetheredTo').validate(function(tetheredTo, done) {
  var id = this.id;
  return OwerModel.find({
    tetheredTo: tetheredTo,
    firstName: this.firstName,
    lastName: this.lastName
  }, function(err, owers) {
    if (err) return done(false);
    else if (owers.length === 1 && String(owers[0]._id) !== String(id)) return done(false);
    else if (owers.length > 1) return done(false);

    done(true);
  });
});