var dbURI          = process.env.MONGO_TEST || 'mongodb://localhost:27018'
  , should         = require('chai').should()
  , expect         = require('chai').expect
  , mongoose       = require('mongoose')
  , Promise        = require('bluebird')
  , ClientModel    = require('../api/models/auth/client.js').ClientModel
  , clients        = require('../api/controllers/clients.js')
  , clearDB        = require('mocha-mongoose')(dbURI)
  , chai           = require('chai')
  , chaiAsPromised = require('chai-as-promised')
  , chaiThings     = require('chai-things');

chai.use(chaiAsPromised);
chai.use(chaiThings);

Promise.promisifyAll(mongoose);

process.env.NODE_ENV = 'test';

var createClient = function(name, clientId, clientSecret) {
  return new ClientModel({
    name:         name,
    clientId:     clientId,
    clientSecret: clientSecret
  });
};

var saveClient = function(name, clientId, clientSecret, done) {
  var client = createClient(name, clientId, clientSecret);

  return client.save(done);
};

var saveClient1 = function(done) {
  return saveClient('Postman', 'postman_id', 'postman_secret', done);
};

var saveClient2 = function(done) {
  return saveClient('name', 'client', 'secret', done);
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
      code.should.equal(expectedCode);
      return obj;
    }
  };

  return obj;
};

var mockReq = function(name, id, secret) {
  var obj = {
    name:   name,
    id:     id,
    secret: secret
  };

  return {
    body: obj
  };
};

var mockParamReq = {
  param: function(param) {
    if (param !== 'client_id') {
      throw new Error('Invalid parameter');
    }

    return 'postman_id';
  }
};

describe('clients', function() {
  beforeEach(function (done) {
    mongoose.connect(dbURI, function() {
      mongoose.connection.db.dropDatabase(function() {
        done();
      });
    });
  });

  describe('#all()', function() {
    it('can retrieve an empty array', function(done) {
      clients.all(null, mockRes(function(clients) {
        clients.should.be.instanceof(Array);
        clients.should.have.length(0);
        done();
      }));
    });

    it('retrieves a single client', function(done) {
      saveClient1(function(err) {
        clients.all(null, mockRes(function(clients) {
          clients.should.be.instanceof(Array);
          clients.should.have.length(1);
          checkClients(clients);
          done();
        }));
      });
    });

    it('retrieves multiple clients', function(done) {
      saveClient1(saveClient2(function(err) {
        clients.all(null, mockRes(function(clients) {
          clients.should.be.instanceof(Array);
          clients.should.have.length(2);
          checkClients(clients);
          done();
        }));
      }));
    });
  });

  describe('#create()', function() {
    it('should create a client', function(done) {
      var name   = 'myname'
        , id     = 'myid'
        , secret = 'mysecret';

      var mockRequest = mockReq(name, id, secret);

      clients.create(mockRequest, mockRes(function(client) {
        client.should.have.property('name', name);
        client.should.have.property('client_id', id);
        done();
      }, 201));
    });

    it('rejects an empty body', function(done) {
      clients.create(mockReq(), mockRes(function(err) {
        checkErrorResponse(err);
        done();
      }, 400));
    });

    it('requires a name', function(done) {
      var mockRequest = mockReq(null, 'id', 'secret');

      clients.create(mockRequest, mockRes(function(err) {
        checkErrorResponse(err);
        done();
      }, 400));
    });

    it('requires an id and secret', function(done) {
      var mockRequest = mockReq('name');

      clients.create(mockRequest, mockRes(function(err) {
        checkErrorResponse(err);
        done();
      }, 400));
    });
  });

  describe('#show()', function() {
    it('retrieves by id', function(done) {
      saveClient1(function(err) {

        clients.show(mockParamReq, mockRes(function(client) {
          client.clientId.should.equal('postman_id');
          client.clientSecret.should.equal('postman_secret');
          done();
        }, 200));
      });
    });

    it('returns an error when invalid id', function(done) {
      clients.show(mockParamReq, mockRes(function(err) {
        checkErrorResponse(err);
        done();
      }, 404));
    });
  });

  describe('#delete()', function() {
    it('returns an error when invalid id', function(done) {
      clients.delete(mockParamReq, mockRes(function(err) {
        checkErrorResponse(err);
        done();
      }, 404));
    });

    it('deletes a client', function(done) {
      saveClient1(function(err) {
        clients.delete(mockParamReq, mockRes(function(responseObj) {
          responseObj.should.have.property('success', true);
          done();
        }));
      });
    });
  });
});
