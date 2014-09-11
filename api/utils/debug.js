var log = process.env.DEBUG && process.env.NODE_ENV !== 'test';

exports.log = function(message) {
  if (log) {
    console.log(message);
  }
};

exports.trace = function(thing) {
  if (log) {
    console.trace(thing);
  }
};
