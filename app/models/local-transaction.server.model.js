'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/**
 * LocalTransaction Schema
 */
var LocalTransactionSchema = new Schema({
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
  user: {
    type: Schema.ObjectId,
    ref: 'User',
    required: true
  },
  ower: {
    type: Schema.ObjectId,
    ref: 'Ower',
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
  },
  direction: {
    type: String,
    enum: ['toOwer', 'toUser'],
    required: true
  }
});

mongoose.model('LocalTransaction', LocalTransactionSchema);