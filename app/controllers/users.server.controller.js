'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash'),
    mongoose = require('mongoose'),
    User = mongoose.model('User'),
    Balance = mongoose.model('Balance'),
    errorHandler = require('./errors');

var users = {
  users: function(req, res) {
    Balance.find().or([{
      user1: req.user.id
    }, {
      user2: req.user.id
    }]).populate('user1 user2').exec(function(err, balances) {
      if (err) return errorHandler.server(res, err);

      return res.json(_.sortBy(_.map(balances, function(balance) {
        var user = String(balance.user1._id) === String(req.user.id) ? balance.user2 : balance.user1;
        var ret = user.toJSON();
        ret.balance = balance.balance;
        return ret;
      }), function(user) {
        return user.firstName;
      }));
    });
  },
  addFriend: function(req, res) {
    Balance.getBalance(req.user.id, req.body.userId, function(err, balance) {
      if (err) return errorHandler.server(res, err);
      if (!balance) return errorHandler.server(res, 'Unable to create balance object');

      res.status(201).json({
        message: 'Friend created'
      });
    });
  }
};

/**
 * Extend user's controller
 */
module.exports = _.extend(
	require('./users/users.authentication'),
	require('./users/users.authorization'),
	require('./users/users.password'),
	require('./users/users.profile'),
  users
);