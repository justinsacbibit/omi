'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Balance = mongoose.model('Balance'),
	  Schema = mongoose.Schema,
    _ = require('lodash');

var validateParticipants = function validateParticipants(from) {
  if (String(from) === String(this.to)) {
    return false;
  } else if (String(this.creator) !== String(this.to) && String(this.creator) !== String(from)) {
    return false;
  }

  return true;
};

var validateAmount = function validateAmount(amount) {
  return amount >= 0.01;
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
    required: true,
    validate: [validateAmount, 'Amount must be greater than zero']
  },
  note: {
    type: String
  },
  from: {
    type: Schema.ObjectId,
    ref: 'User',
    required: true,
    validate: [validateParticipants, 'From cannot be equal to to, and creator must be equal to either from or to']
  },
  to: {
    type: Schema.ObjectId,
    ref: 'User',
    required: true
  },
  creator: {
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

TransactionSchema.methods.update = function update(data, done) {
  if ((data.from || data.to) && !((String(this.from) === data.from && String(this.to) === data.to) ||
      (String(this.from) === data.to && String(this.to) === data.from))) {
    return done(new Error('Invalid from and to parameters'));
  } else if (data.amount !== undefined && data.amount < 0.01) {
    return done(new Error('Amount must be greater than zero'));
  }

  var trans = this;
  return Balance.getBalance(this.from, this.to, function(err, balance) {
    if (err) return done(err);
    if (!balance) return done(new Error('Unable to find balance'));

    if (!balance.changeBalance(trans.type === 'omi' ? -trans.amount : trans.amount, trans.from, trans.to)) {
      return done(new Error('Validation error'));
    }

    var type = data.type || trans.type;
    var amount = data.amount || trans.amount;
    var from = data.from || trans.from;
    var to = data.to || trans.to;
    if (!balance.changeBalance(type === 'omi' ? amount : -amount, from, to)) {
      return done(new Error('Validation error'));
    }

    trans = _.extend(trans, data);

    return trans.save(function(err) {
      if (err) return done(err);

      return balance.save(function(err) {
        if (err) {
          trans.remove();
          return done(err);
        }

        trans.amount = amount;
        return done(null, trans);
      });
    });
  });
};

TransactionSchema.methods.delete = function del(done) {
  var trans = this;
  return Balance.getBalance(this.from, this.to, function(err, balance) {
    if (err) return done(err);
    if (!balance) return done(new Error('Unable to find balance'));

    if (!balance.changeBalance(trans.type === 'omi' ? -trans.amount : trans.amount, trans.from, trans.to)) {
      return done(new Error('Server error'));
    }

    return trans.remove(function(err) {
      if (err) return done(err);

      return balance.save(function(err) {
        if (err) return done(err);

        return done(null, trans);
      });
    });
  });
};

mongoose.model('Transaction', TransactionSchema);