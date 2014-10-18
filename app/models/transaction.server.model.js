'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

var validateParticipants = function validateParticipants(from) {
  if (String(from) === String(this.to)) {
    return false;
  }

  return true;
};

/**
 * Transaction Schema
 */
var TransactionSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  note: {
    type: String
  },
  from: {
    type: Schema.ObjectId,
    ref: 'User',
    required: true,
    validate: [validateParticipants, 'From cannot be equal to to']
  },
  to: {
    type: Schema.ObjectId,
    ref: 'User',
    required: true
  },
  created: {
    type: Date,
    default: Date.now
  },
  type: {
    type: String,
    enum: ['omi', 'payment'],
    required: true
  }
});

mongoose.model('Transaction', TransactionSchema);