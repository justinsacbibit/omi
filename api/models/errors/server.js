var SubclassError = require('subclass-error');

var ServerError   = exports.ServerError   = SubclassError('ServerError')
  , DatabaseError = exports.DatabaseError = SubclassError('DatabaseError', ServerError);
