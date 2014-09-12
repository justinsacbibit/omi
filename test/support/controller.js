var mockRes = exports.mockRes = function mockRes(cb, expectedCode) {
  var obj = {
    json:   cb,
    status: function status(code) {
      code.should.equal(expectedCode);
      return obj;
    }
  };

  return obj;
};
