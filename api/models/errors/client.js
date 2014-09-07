var SubclassError = require('subclass-error');

var code = function(code) {
  return {
    statusCode: code
  };
};

var ClientError = SubclassError('ClientError', code(400));

exports.NotFoundError = SubclassError('NotFoundError', ClientError, code(404));
exports.ExistsError   = SubclassError('ExistsError', ClientError, code(409))
exports.ConflictError = SubclassError('ConflictError', ClientError, code(409));
