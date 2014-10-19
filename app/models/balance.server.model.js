'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	  Schema = mongoose.Schema;

var validateParticipants = function validateParticipants(user1) {
  if (String(user1) === String(this.user2) || String(user1) > String(this.user2)) {
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

BalanceSchema.statics.getBalance = function getBalance(user1, user2, done) {
  if (String(user1) > String(user2)) {
    var temp = user1;
    user1 = user2;
    user2 = temp;
  }

  var data = {
    user1: user1,
    user2: user2
  };

  var _this = this;

  this.findOne(data, function(err, balance) {
    if (err) return done(err);
    if (!balance) {
      balance = _this(data);
      return balance.save(function(err) {
        if (err) return done(err);

        return done(null, balance);
      });
    }

    done(null, balance);
  });
};

BalanceSchema.methods.changeBalance = function changeBalance(delta, from, to) {
  var user1 = String(from) < String(to) ? from : to,
      user2 = String(from) < String(to) ? to : from;

  if (String(from) === String(this.user1) && String(to) === String(this.user2)) {
    this.balance += Number(delta);
  } else if (String(to) === String(this.user1) && String(from) === String(this.user2)) {
    this.balance -= Number(delta);
  } else {
    return false;
  }

  return true;
};

mongoose.model('Balance', BalanceSchema);