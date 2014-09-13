var mongoose = require('mongoose')
  , mockgoose = require('mockgoose');

mockgoose(mongoose);

var clear = exports.clear = function() {
  mockgoose.reset();
};
