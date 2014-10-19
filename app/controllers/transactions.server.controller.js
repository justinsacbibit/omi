'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Transaction = mongoose.model('Transaction'),
    User = mongoose.model('User'),
    Balance = mongoose.model('Balance'),
    errorHandler = require('./errors'),
    _ = require('lodash');

/**
 * Create a Transaction
 */
exports.create = function(req, res) {
  var isFromLoggedInUser = String(req.body.from) === String(req.user.id);
  var idToFind = isFromLoggedInUser ? req.body.to : req.body.from;

  User.findById(idToFind).exec(function(err, user) {
    if (err) return errorHandler.server(res, err);
    if (!user) return errorHandler.notFound(res, 'User not found');

    Transaction.newTransaction(req.body, function(err, transaction) {
      if (err) return errorHandler.badRequest(res, err);
      if (!transaction) return errorHandler.server(res, 'Unable to create transaction.');

      res.status(201).json(transaction);
    });
  });
};

/**
 * Show the current Transaction
 */
exports.read = function(req, res) {
  res.json(req.transaction);
};

/**
 * Update a Transaction
 */
exports.update = function(req, res) {
  req.transaction.update(req.body, function(err, transaction) {
    if (err) return errorHandler.badRequest(res, err);
    if (!transaction) return errorHandler.badRequest(res, 'Unable to update transaction');

    res.json(transaction);
  });
};

/**
 * Delete a Transaction
 */
exports.delete = function(req, res) {
  req.transaction.delete(function(err, transaction) {
    if (!err) return errorHandler.badRequest(res, err);
    if (!transaction) return errorHandler.server(res, 'Unable to delete transaction');

    res.json({
      message: 'Transaction successfully deleted'
    });
  });
};

/**
 * List of Transactions
 */
exports.list = function(req, res) {
  Transaction.find().or([{
    from: req.user.id
  }, {
    to: req.user.id
  }]).sort('-created').exec(function(err, transactions) {
    if (err) return errorHandler.server(res, err);

    res.json(transactions);
  });
};

exports.canCreate = function canCreate(req, res, next) {
  if (req.body.from && String(req.body.from) !== String(req.user.id) &&
      req.body.to && String(req.body.to) !== String(req.user.id)) {
    return errorHandler.forbidden(res, 'User is not authorized to create that transaction');
  } else if (!req.body.from || !req.body.to) {
    return errorHandler.badRequest(res, 'From and to must be included in body');
  }
  next();
};

exports.hasAuthorization = function hasAuthorization(req, res, next) {
  if (String(req.transaction.from) !== String(req.user.id) && String(req.transaction.to) !== String(req.user.id)) {
    return errorHandler.forbidden(res, 'User is not authorized to perform that action');
  }
  next();
};

exports.transactionById = function transactionById(req, res, next, id) {
  Transaction.findById(id).exec(function(err, transaction) {
    if (err) return next(err);
    if (!transaction) return next(new Error('Transaction not found'));
    req.transaction = transaction;
    next();
  });
};
