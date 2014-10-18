'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	  Schema = mongoose.Schema;

var validateParticipants = function validateParticipants(user1) {
  if (String(user1) === String(this.user2)) {
    return false;
  }

  return true;
};

/**
 * Balance Schema
 */
var BalanceSchema = new Schema({
  user1: {
    type: Schema.ObjectId,
    ref: 'User',
    required: true,
    validate: [validateParticipants, 'Users must not be equal']
  },
  user2: {
    type: Schema.ObjectId,
    ref: 'User',
    required: true
  },
  balance: {
    type: Number,
    default: 0
  }
});

mongoose.model('Balance', BalanceSchema);