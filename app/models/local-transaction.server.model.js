'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    _ = require('lodash'),
	  Schema = mongoose.Schema;

var validateAmount = function validateAmount(amount) {
  return amount >= 0.01;
};

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
    required: true,
    validate: [validateAmount, 'Amount must be greater than zero']
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

LocalTransactionSchema.statics.newLocalTransaction = function newLocalTransaction(data, ower, done) {
  var LocalTransaction = this;

  var localTransaction = new LocalTransaction(data);
  localTransaction.save(function(err) {
    if (err) return done(err);

    if ((localTransaction.direction === 'toOwer' && localTransaction.type === 'omi') ||
      (localTransaction.direction !== 'toOwer' && localTransaction.type !== 'omi')) {
      ower.balance += Number(localTransaction.amount);
    } else {
      ower.balance -= Number(localTransaction.amount);
    }

    ower.save(function(err) {
      if (err) return done(err);

      return done(null, localTransaction);
    });
  });
};

LocalTransactionSchema.methods.update = function update(data, ower, done) {
  if (data.owerId && String(data.owerId) !== String(this.ower)) {
    return done(new Error('Cannot update ower for a transaction'));
  }

  var localTransaction = this;
  if ((localTransaction.direction === 'toOwer' && localTransaction.type === 'omi') ||
      (localTransaction.direction !== 'toOwer' && localTransaction.type !== 'omi')) {
    ower.balance -= Number(localTransaction.amount);
  } else {
    ower.balance += Number(localTransaction.amount);
  }

  var amount = data.amount || localTransaction.amount,
  direction = data.direction || localTransaction.direction,
  type = data.type || localTransaction.type;

  if ((direction === 'toOwer' && type === 'omi') || (direction !== 'toOwer' && type !== 'omi')) {
    ower.balance += Number(amount);
  } else {
    ower.balance -= Number(amount);
  }

  localTransaction = _.extend(localTransaction, data);
  localTransaction.save(function(err) {
    if (err) return done(err);

    ower.save(function(err) {
      if (err) return done(err);

      done(null, localTransaction);
    });
  });
};

LocalTransactionSchema.methods.delete = function del(ower, done) {
  var localTransaction = this;
  if ((localTransaction.direction === 'toOwer' && localTransaction.type === 'omi') ||
      (localTransaction.direction !== 'toOwer' && localTransaction.type !== 'omi')) {
    ower.balance -= Number(localTransaction.amount);
  } else {
    ower.balance += Number(localTransaction.amount);
  }

  localTransaction.save(function(err) {
    if (err) return done(err);

    ower.save(function(err) {
      if (err) return done(err);

      return done(null, localTransaction);
    });
  });
};

mongoose.model('LocalTransaction', LocalTransactionSchema);