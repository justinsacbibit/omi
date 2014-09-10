var dbURI       = process.env.MONGO_TEST || 'mongodb://localhost:27018'
  , should      = require('chai').should()
  , expect      = require('chai').expect
  , mongoose    = require('mongoose')
  , Promise     = require('bluebird')
  , ClientModel = require('../api/models/auth/client.js').ClientModel
  , clients     = require('../api/controllers/clients.js')
  , clearDB     = require('mocha-mongoose')(dbURI)
  , chai        = require('chai')
  , chaiAsPromised = require('chai-as-promised');

chai.use(chaiAsPromised);

Promise.promisifyAll(mongoose);

var name1         = 'Postman'
  , clientId1     = 'postman_id'
  , clientSecret1 = 'postman_secret';

var name2         = 'name'
  , clientId2     = 'client'
  , clientSecret2 = 'secret';

var createClient = function(name, clientId, clientSecret, done) {
  var client = new ClientModel({
    name:         name,
    clientId:     clientId,
    clientSecret: clientSecret
  });

  return client.save(done);
}

var createClient1 = function(done) {
  return createClient(name1, clientId1, clientSecret1, done);
}

var createClient2 = function(done) {
  return createClient(name2, clientId2, clientSecret2, done);
}

describe('clients', function() {
  beforeEach(function (done) {
        mongoose.connect(dbURI, function(){
            mongoose.connection.db.dropDatabase(function(){
                done()
            })
        })
    })

  describe('#all()', function() {
    it('can return an empty array', function(done) {
      var mockRes = {
        json: function(clients) {
          clients.should.be.instanceof(Array);
          clients.should.have.length(0);
          done();
        }
      };
      return clients.all(null, mockRes);
    });

    it('returns a single client', function(done) {
      createClient1(function(err) {
        if (err) {
          return done(err);
        }

        var mockRes = {
          json: function(clients) {
            clients.should.be.instanceof(Array);
            clients.should.have.length(1);
            clients[0].should.have.property('name', name1);
            clients[0].should.have.property('clientId', clientId1);
            clients[0].should.have.property('clientSecret', clientSecret1);
            done();
          }
        };

        return clients.all(null, mockRes);
      });
    });

    it('returns multiple clients', function(done) {
      createClient1(createClient2(function(err) {
        if (err) {
          return done(err);
        }

        var mockRes = {
          json: function(clients) {
            clients.should.be.instanceof(Array);
            clients.should.have.length(2);
            done();
          }
        };

        return clients.all(null, mockRes);
      }));
    });
  });
});
