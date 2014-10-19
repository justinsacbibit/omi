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
  users: function users(req, res) {
    Balance.find().or([{
      user1: req.user.id
    }, {
      user2: req.user.id
    }]).populate('user1 user2').exec(function(err, balances) {
      if (err) return errorHandler.server(res, err);

      return res.json(_.sortBy(_.map(balances, function(balance) {
        var user = String(balance.user1._id) === String(req.user.id) ? balance.user2 : balance.user1;
        var ret = user.toJSON();
        ret.balance = String(balance.user1._id) === String(req.user.id) ? balance.balance : -balance.balance;
        return ret;
      }), function(user) {
        return user.firstName;
      }));
    });
  },
  read: function read(req, res) {
    var user1 = String(req.user.id) < String(req.profile.id) ? req.user.id : req.profile.id;
    var user2 = String(req.user.id) < String(req.profile.id) ? req.profile.id : req.user.id;
    Balance.findOne({
      user1: user1,
      user2: user2
    }).populate('user1 user2').exec(function(err, balance) {
      if (err) return errorHandler.server(res, err);
      if (!balance) return errorHandler.badRequest(res, 'You are not friends with that user');

      var user = String(balance.user1._id) === String(req.user.id) ? balance.user2 : balance.user1;
      var ret = user.toJSON();
      ret.balance = String(balance.user1._id) === String(req.user.id) ? balance.balance : -balance.balance;
      res.json(ret);
    });
  },
  addFriend: function addFriend(req, res) {
    User.findOne({
      username: req.body.username
    }, function(err, user) {
      if (err) return errorHandler.server(res, err);
      if (!user) return errorHandler.notFound(res, 'There is no user with that username');

      Balance.getBalance(req.user.id, user.id, function(err, balance) {
        if (err) return errorHandler.server(res, err);
        if (!balance) return errorHandler.server(res, 'Unable to create balance object');

        res.status(201).json(user);
      });
    });
  },
  deleteFriend: function deleteFriend(req, res) {
    User.findById(req.param('friendId'), function(err, user) {
      if (err) return errorHandler.badRequest(res, err);
      if (!user) return errorHandler.notFound(res, 'There is no user with that username');

      Balance.getBalance(req.user.id, user.id, function(err, balance) {
        if (err) return errorHandler.server(res, err);
        if (!balance) return res.json({ message: 'Friend deleted' });

        balance.remove(function(err) {
          if (err) return errorHandler.server(res, err);

          res.json({ message: 'Friend deleted' });
        });
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