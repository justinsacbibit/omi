'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	errorHandler = require('./errors'),
	Omi = mongoose.model('Omi'),
	_ = require('lodash');

/**
 * Create a Omi
 */
exports.create = function(req, res) {
	var omi = new Omi(req.body);
	omi.user = req.user;

	omi.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(omi);
		}
	});
};

/**
 * Show the current Omi
 */
exports.read = function(req, res) {
	res.jsonp(req.omi);
};

/**
 * Update a Omi
 */
exports.update = function(req, res) {
	var omi = req.omi ;

	omi = _.extend(omi , req.body);

	omi.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(omi);
		}
	});
};

/**
 * Delete an Omi
 */
exports.delete = function(req, res) {
	var omi = req.omi ;

	omi.remove(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(omi);
		}
	});
};

/**
 * List of Omis
 */
exports.list = require('./transactions').list;
// function(req, res) { Omi.find().sort('-created').populate('user', 'displayName').exec(function(err, omis) {
// 		if (err) {
// 			return res.status(400).send({
// 				message: errorHandler.getErrorMessage(err)
// 			});
// 		} else {
// 			res.jsonp(omis);
// 		}
// 	});
// };

/**
 * Omi middleware
 */
exports.omiByID = function(req, res, next, id) { Omi.findById(id).populate('user', 'displayName').exec(function(err, omi) {
		if (err) return next(err);
		if (! omi) return next(new Error('Failed to load Omi ' + id));
		req.omi = omi ;
		next();
	});
};

/**
 * Omi authorization middleware
 */
exports.hasAuthorization = function(req, res, next) {
	if (req.omi.user.id !== req.user.id) {
		return res.status(403).send('User is not authorized');
	}
	next();
};