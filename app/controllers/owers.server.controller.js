'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Ower = mongoose.model('Ower'),
    errorHandler = require('./errors'),
    _ = require('lodash');

/**
 * Create a Ower
 */
exports.create = function(req, res) {
  var ower = new Ower(req.body);
  ower.tetheredTo = req.user.id;

  return ower.save(function(err) {
    if (err) {
      return errorHandler.badRequest(res, err);
    }

    res.status(201).json(ower);
  });
};

/**
 * Show the current Ower
 */
exports.read = function(req, res) {
  res.json(req.ower);
};

/**
 * Update a Ower
 */
exports.update = function(req, res) {
  var ower = req.ower;
  ower = _.extend(ower, req.body);

  ower.save(function(err) {
    if (err) {
      return errorHandler.badRequest(res, err);
    }

    res.json(ower);
  });
};

/**
 * Delete an Ower
 */
exports.delete = function(req, res) {
  var ower = req.ower;

  ower.remove(function(err) {
    if (err) {
      return errorHandler.server(res, err);
    }

    res.json({
      message: 'Ower ' + ower.id + ' successfully deleted'
    });
  });
};

/**
 * List of Owers
 */
exports.list = function(req, res) {
  Ower.find(({
    tetheredTo: req.user.id
  })).sort([['firstName', 'ascending']]).exec(function(err, owers) {
    if (err) {
      return errorHandler.server(res, err);
    }

    res.json(owers);
  });
};

/**
 * Ower middleware
 */
exports.owerById = function owerById(req, res, next, id) {
  Ower.findById(id).exec(function(err, ower) {
    if (err) return next(err);
    if (!ower) return next(new Error('Ower not found'));
    req.ower = ower;
    next();
  });
};

exports.cannotModifyBalance = function cannotModifyBalance(req, res, next) {
  if (req.body.balance) {
    return next(new Error('Cannot modify balance'));
  }
  next();
};

/**
 * Ower authorization middleware
 */
exports.hasAuthorization = function hasAuthorization(req, res, next) {
  if (String(req.ower.tetheredTo) !== String(req.user.id)) {
    return errorHandler.forbidden(res, 'User is not authorized to perform that action');
  }
  next();
};

