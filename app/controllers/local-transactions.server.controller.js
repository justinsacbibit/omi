'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    LocalTransaction = mongoose.model('LocalTransaction'),
    User = mongoose.model('User'),
    Ower = mongoose.model('Ower'),
    errorHandler = require('./errors'),
    _ = require('lodash');

/**
 * Create a Local transaction
 */
exports.create = function(req, res) {
  req.body.ower = req.ower.id;
  req.body.user = req.user.id;
  LocalTransaction.newLocalTransaction(req.body, req.ower, function(err, localTransaction) {
    if (err) return errorHandler.badRequest(res, err);
    if (!localTransaction) return errorHandler.server(res, 'Unable to create local transaction');

    res.status(201).json(localTransaction);
  });
};

/**
 * Show the current Local transaction
 */
exports.read = function(req, res) {
  res.json(req.localTransaction);
};

/**
 * Update a Local transaction
 */
exports.update = function(req, res) {
  req.localTransaction.update(req.body, req.ower, function(err, localTransaction) {
    if (err) return errorHandler.badRequest(res, err);

    res.json(localTransaction);
  });
};

/**
 * Delete an Local transaction
 */
exports.delete = function(req, res) {
  req.localTransaction.delete(req.ower, function(err, localTransaction) {
    if (err) return errorHandler.server(res, err);

    res.json({
      message: 'Successfully deleted local transaction'
    });
  });
};

/**
 * List of Local transactions
 */
exports.list = function(req, res) {
  var query = {
    user: req.user.id
  };

  if (req.query.owerId) {
    query.ower = req.query.owerId;
  }
  console.log(query);

  LocalTransaction.find(query, function(err, localTransactions) {
    if (err) return errorHandler.server(res, err);

    res.json(localTransactions);
  });
};

exports.hasAuthorization = function hasAuthorization(req, res, next) {
  var userId = typeof req.localTransaction.user === String ? req.localTransaction.user : req.localTransaction.user.id;
  if (String(userId) !== String(req.user.id)) {
    return errorHandler.forbidden(res, 'User is not authorized to perform that action');
  }
  next();
};

exports.attachOwer = function attachOwer(req, res, next) {
  if (!req.body.owerId) {
    return next(new Error('Ower ID must be included in the body'));
  }
  Ower.findById(req.body.owerId).exec(function(err, ower) {
    if (err) return next(err);
    if (!ower) return next(new Error('Ower not found'));
    req.ower = ower;
    next();
  });
};

exports.canCreate = function canCreate(req, res, next) {
  var userId = !req.ower.tetheredTo._id ? req.ower.tetheredTo : req.ower.tetheredTo.id;
  if (String(userId) !== String(req.user.id)) {
    console.log(userId)
    console.log(req.user.id)
    return errorHandler.forbidden(res, 'User is not authorized to create a transaction for that ower');
  }
  next();
};

exports.localTransactionById = function localTransactionById(req, res, next, id) {
  LocalTransaction.findById(id).populate('user ower', 'id firstName lastName').exec(function(err, localTransaction) {
    if (err) return next(err);
    if (!localTransaction) return next(new Error('Local transaction not found'));
    req.localTransaction = localTransaction;
    next();
  });
};