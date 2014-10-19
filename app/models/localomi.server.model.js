'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/**
 * Localomi Schema
 */
var LocalomiSchema = new Schema({
	name: {
		type: String,
		default: '',
		required: 'Please fill Localomi name',
		trim: true
	},
	created: {
		type: Date,
		default: Date.now
	},
	user: {
		type: Schema.ObjectId,
		ref: 'User'
	}
});

mongoose.model('Localomi', LocalomiSchema);