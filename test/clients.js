var mongoose    = require('mongoose')
  , dbURI       = process.env.MONGO_TEST || 'mongodb://localhost:27018'
  , ClientModel = require('../api/models/auth/client.js').ClientModel
  , clients     = require('../api/controllers/clients.js');

var saveClient = function(name, clientId, clientSecret, done) {
  var client = new ClientModel({
    name:         name,
    clientId:     clientId,
    clientSecret: clientSecret
  });

  return client.save(done);
};

var name1 = 'Postman'
  , id1 = 'postman_id'
  , secret1 = 'postman_secret';

var name2 = 'name'
  , id2 = 'client'
  , secret2 = 'secret';

var saveClient1 = function(done) {
  return saveClient(name1, id1, secret1, done);
};

var saveClient2 = function(done) {
  return saveClient(name2, id2, secret2, done);
};

var checkClients = function(clients) {
  clients.should.all.have.property('name');
  clients.should.all.have.property('clientId');
  clients.should.all.have.property('clientSecret');
};

var checkErrorResponse = function(err) {
  err.should.have.deep.property('error.message');
  err.should.have.deep.property('error.code');
};

var mockRes = function(cb, expectedCode) {
  var obj = {
    json:   cb,
    status: function(code) {
      // console.trace(expectedCode)
      code.should.equal(expectedCode);
      return obj;
    }
  };

  return obj;
};

var mockErrorRes = function(expectedCode, done) {
  return mockRes(function(err) {
    checkErrorResponse(err);
    done();
  }, expectedCode);
};

var mockBodyReq = function(name, id, secret) {
  var obj = {
    name:   name,
    id:     id,
    secret: secret
  };

  return {
    body: obj
  };
};

var mockParamReq = function(id) {
  return {
    param: function(param) {
      if (param !== 'client_id') {
        throw new Error('Invalid parameter');
      }

      return id;
    }
  };
};

describe('clients', function() {
  beforeEach(function (done) {
    mongoose.connect(dbURI, function() {
      mongoose.connection.db.dropDatabase(function(err) {
        saveClient1(function(err) {
          done(err);
        });
      });
    });
  });

  describe('#all()', function() {
    it('can retrieve an empty array', function(done) {
      ClientModel.find().remove(function(err) {
        clients.all(null, mockRes(function(clients) {
          clients.should.be.instanceof(Array);
          clients.should.have.length(0);
          done(err);
        }));
      });
    });

    it('retrieves a single client', function(done) {
      clients.all(null, mockRes(function(clients) {
        clients.should.be.instanceof(Array);
        clients.should.have.length(1);
        checkClients(clients);
        done();
      }));
    });

    it('retrieves multiple clients', function(done) {
      saveClient2(function(err) {
        clients.all(null, mockRes(function(clients) {
          clients.should.be.instanceof(Array);
          clients.should.have.length(2);
          checkClients(clients);
          done(err);
        }));
      });
    });
  });

  describe('#create()', function() {
    it('should create a client', function(done) {
      var mockRequest = mockBodyReq(name2, id2, secret2);

      clients.create(mockRequest, mockRes(function(client) {
        client.should.have.property('name', name2);
        client.should.have.property('client_id', id2);
        done();
      }, 201));
    });

    it('rejects an empty body', function(done) {
      clients.create(mockBodyReq(), mockErrorRes(400, done));
    });

    it('requires a name', function(done) {
      var mockRequest = mockBodyReq(null, id2, secret2);

      clients.create(mockRequest, mockErrorRes(400, done));
    });

    it('requires an id and secret', function(done) {
      var mockRequest = mockBodyReq(name2);

      clients.create(mockRequest, mockErrorRes(400, done));
    });
  });

  describe('#show()', function() {
    it('retrieves by id', function(done) {
      clients.show(mockParamReq(id1), mockRes(function(client) {
        client.clientId.should.equal(id1);
        client.clientSecret.should.equal(secret1);
        done();
      }, 200));
    });

    it('returns an error when invalid id', function(done) {
      clients.show(mockParamReq(id2), mockErrorRes(404, done));
    });
  });

  describe('#delete()', function() {
    it('returns an error when invalid id', function(done) {
      clients.delete(mockParamReq(id2), mockErrorRes(404, done));
    });

    it('deletes a client', function(done) {
      clients.delete(mockParamReq(id1), mockRes(function(responseObj) {
        responseObj.should.have.property('success', true);
        done();
      }));
    });
  });
});
