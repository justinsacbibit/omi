var Q = require('q');

var defer = function(Model, func, args) {
  var deferred = Q.defer();
  var args = Array.prototype.slice.call(arguments, 2);

  args.push(function(err, obj) {
    if (err) {
      return deferred.reject(err);
    }

    return deferred.resolve(obj);
  });

  func.apply(Model, args);

  return deferred.promise;
};

exports.mongoose = function() {
  return defer.apply(this, arguments);
};
