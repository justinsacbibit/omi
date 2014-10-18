'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    crypto = require('crypto'),
	  Schema = mongoose.Schema;

/**
 * AccessToken Schema
 */
var AccessTokenSchema = new Schema({
  user: {
    type: Schema.ObjectId,
    ref: 'User',
    required: true
  },
  token: {
    type: String,
    unique: true,
    required: true
  },
  created: {
    type: Date,
    default: Date.now
  }
});

AccessTokenSchema.methods.isExpired = function isExpired() {
  return Math.round((Date.now() - this.created) / 1000) > 5184000;
};

AccessTokenSchema.statics.newToken = function newToken(user) {
  return new this({
    user: user,
    token: crypto.randomBytes(32).toString('base64')
  });
};

mongoose.model('AccessToken', AccessTokenSchema);