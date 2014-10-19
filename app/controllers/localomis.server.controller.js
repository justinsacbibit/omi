'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	errorHandler = require('./errors'),
	Localomi = mongoose.model('Localomi'),
	_ = require('lodash');

/**
 * Create a Localomi
 */
exports.create = function(req, res) {
	var localomi = new Localomi(req.body);
	localomi.user = req.user;

	localomi.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(localomi);
		}
	});
};

/**
 * Show the current Localomi
 */
exports.read = function(req, res) {
	res.jsonp(req.localomi);
};

/**
 * Update a Localomi
 */
exports.update = function(req, res) {
	var localomi = req.localomi ;

	localomi = _.extend(localomi , req.body);

	localomi.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(localomi);
		}
	});
};

/**
 * Delete an Localomi
 */
exports.delete = function(req, res) {
	var localomi = req.localomi ;

	localomi.remove(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(localomi);
		}
	});
};

/**
 * List of Localomis
 */
exports.list = function(req, res) { Localomi.find().sort('-created').populate('user', 'displayName').exec(function(err, localomis) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(localomis);
		}
	});
};

/**
 * Localomi middleware
 */
exports.localomiByID = function(req, res, next, id) { Localomi.findById(id).populate('user', 'displayName').exec(function(err, localomi) {
		if (err) return next(err);
		if (! localomi) return next(new Error('Failed to load Localomi ' + id));
		req.localomi = localomi ;
		next();
	});
};

/**
 * Localomi authorization middleware
 */
exports.hasAuthorization = function(req, res, next) {
	if (req.localomi.user.id !== req.user.id) {
		return res.status(403).send('User is not authorized');
	}
	next();
};