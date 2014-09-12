var controller = require('./controller.js');

var mockRes = exports.mockRes = function mockErrorRes(expectedCode, done) {
  return controller.mockRes(function(err) {
    checkResponse(err);
    done();
  }, expectedCode);
};

var checkResponse = exports.checkResponse = function checkErrorResponse(err) {
  err.should.have.deep.property('error.message');
  err.should.have.deep.property('error.code');
};
