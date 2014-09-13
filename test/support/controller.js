var mockRes = exports.mockRes = function mockRes(cb, expectedCode) {
  if (!expectedCode) {
    expectedCode = 200;
  }
  
  var obj = {
    json:   cb,
    status: function status(code) {
      code.should.equal(expectedCode);
      return obj;
    }
  };

  return obj;
};
