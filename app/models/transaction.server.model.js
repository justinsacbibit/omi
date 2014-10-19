'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Balance = mongoose.model('Balance'),
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

TransactionSchema.statics.newTransaction = function newTransaction(data, done) {
  var Trans = this;
  return Balance.getBalance(data.from, data.to, function(err, balance) {
    if (err) return done(err);
    if (!balance) return done(new Error('Unable to create balance'));

    if (!balance.changeBalance(data.type === 'omi' ? data.amount : -data.amount, data.from, data.to)) {
      return done(new Error('Validation error'));
    }

    var transaction = new Trans(data);
    return transaction.save(function(err) {
      if (err) return done(err);

      return balance.save(function(err) {
        if (err) {
          console.log('Fatal error. Failure to update balance after new transaction. Attempting to recover.');
          transaction.remove();
          return done(err);
        }

        return done(null, transaction);
      });
    });
  });
};

mongoose.model('Transaction', TransactionSchema);