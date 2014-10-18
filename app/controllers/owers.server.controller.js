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

};

/**
 * Update a Ower
 */
exports.update = function(req, res) {

};

/**
 * Delete an Ower
 */
exports.delete = function(req, res) {

};

/**
 * List of Owers
 */
exports.list = function(req, res) {

};