var _ = require('underscore')
  , db = require('./support/db.js')
  , error = require('./support/error.js')
  , controller = require('./support/controller.js')
  , UserModel = require('../api/models/people/user.js').UserModel
  , OwerModel = require('../api/models/people/ower.js').OwerModel
  , OwerRequestModel = require('../api/models/requests/owerRequest.js').OwerRequestModel
  , owers = require('../api/controllers/owers.js');

var newUser = function newUser(obj) {
  return new UserModel(obj);
};

var newOwer = function newOwer(obj) {
  return new OwerModel(obj);
};

var dict = function dict(name, facebookId, tetheredTo) {
  return {
    name: name,
    facebookId: facebookId,
    tetheredTo: tetheredTo
  };
};

var user1 = dict('user1name', 54321);
var user2 = dict('user2name', 23456);
var ower1 = dict('ower1name', 12345, user1.facebookId);
var ower2 = dict('ower2name', null, user1.facebookId);
var ower3 = dict('ower3name', null, user2.facebookId);

var people = function people() {
  var users = _.map([user1, user2], function(el) {
    return newUser(el);
  });
  var owers = _.map([ower1, ower2, ower3], function(el) {
    return newOwer(el);
  });

  return users.concat(owers);
};

var mockReq = function(facebookId, params) {
  return {
    param: function(param) {
      if (param === 'facebook_id') {
        return facebookId;
      }
    },
    user: {
      facebookId: facebookId
    },
    query: params,
    body: params
  };
};

var mockRes = controller.mockRes;
var mockErrorRes = error.mockRes;

var save = function save(arr, cb, idx) {
  if (!idx) {
    idx = 0;
  }

  var el = arr[idx];

  if (idx === (arr.length - 1)) {
    return el.save(cb);
  }

  return el.save(function(err) {
    return save(arr, cb, idx + 1);
  });
};

var checkOwer = function checkOwer(ower, name, facebookId, tetheredTo) {
  ower.should.have.property('name', name);
  ower.should.have.property('facebookId', facebookId);
  ower.should.have.property('tetheredTo', tetheredTo);
  ower.should.have.property('type', 'ower');
  ower.should.have.property('balance', 0);
};

var checkOwer1 = function checkOwer1(ower) {
  checkOwer(ower, user2.name, user2.facebookId, user1.facebookId);
};

var checkOwer2 = function checkOwer2(ower) {
  checkOwer(ower, user1.name, user1.facebookId, user2.facebookId);
};

describe('owers', function() {
  beforeEach(function(done) {
    OwerModel.find().remove(function(err) {
      if (err) {
        return done(err);
      }

      OwerRequestModel.find().remove(function(err) {
        if (err) {
          return done(err);
        }

        return save(people(), function(err) {
          done(err);
        });
      });
    });
  });

  describe('#all()', function() {
    it('does not return users', function(done) {
      owers.all(mockReq(null, {}), mockRes(function(owers) {
        owers.should.all.not.have.property('type', 'user');
        done();
      }));
    });

    it('only returns owers', function(done) {
      owers.all(mockReq(null, {}), mockRes(function(owers) {
        owers.should.all.have.property('type', 'ower');
        done();
      }));
    });

    it('can return all owers', function(done) {
      owers.all(mockReq(null, {}), mockRes(function(owers) {
        owers.should.have.length(3);
        done();
      }));
    });

    it('can filter by name', function(done) {
      owers.all(mockReq(null, {
        name: '2'
      }), mockRes(function(owers) {
        owers.should.have.length(1);
        owers[0].name.should.equal(ower2.name);
        done();
      }));
    });

    it('returns an error with invalid pagination parameters', function(done) {
      owers.all(mockReq(null, {
        limit: 0
      }), mockRes(function(err) {
        error.checkResponse(err);
        done();
      }, 400));
    });

    it('can filter by Facebook ID', function(done) {
      owers.all(mockReq(null, {
        facebook_id: ower1.facebookId
      }), mockRes(function(owers) {
        owers.should.have.length(1);
        owers[0].name.should.equal(ower1.name);
        done();
      }));
    });

    it('can retrieve owers tethered to a Facebook ID', function(done) {
      owers.all(mockReq(user2.facebookId, {}), mockRes(function(owers) {
        owers.should.have.length(1);
        owers.should.include.a.thing.with.property('name', ower3.name);
        done();
      }));
    });
  });

  describe('#create()', function() {
    it('returns an error if the request contains a name and Facebook ID at the same time', function(done) {
      owers.create(mockReq(null, {
        name: 'name',
        facebook_id: 'facebookId'
      }), mockErrorRes(400, done));
    });

    it('returns an error if the ower is self', function(done) {
      var facebookId = 12345;
      owers.create(mockReq(facebookId, {
        facebook_id: facebookId
      }), mockErrorRes(400, done));
    });

    it('returns an error if no parameters are provided', function(done) {
      owers.create(mockReq(null, {}), mockErrorRes(400, done));
    });

    it('creates a non-Facebook ower', function(done) {
      var name = 'Non-Facebook Ower';
      owers.create(mockReq(user1.facebookId, {
        name: name
      }), mockRes(function(ower) {
        ower.should.have.property('name', name);
        ower.should.have.property('tetheredTo', user1.facebookId);
        ower.should.have.property('type', 'ower');
        ower.should.have.property('balance', 0);
        done();
      }, 201));
    });

    it('returns an error for an existing ower', function(done) {
      var name = 'Non-Facebook Ower';
      var mockRequest = mockReq(user1.facebookId, {
        name: name
      });
      owers.create(mockRequest, mockRes(function(ower) {
        owers.create(mockRequest, mockErrorRes(409, done));
      }, 201));
    });

    it('returns an error when adding a non-existing Facebook ower', function(done) {
      owers.create(mockReq(user1.facebookId, {
        facebook_id: 9183756371
      }), mockErrorRes(404, done));
    });

    it('creates a Facebook ower without a counterpart', function(done) {
      owers.create(mockReq(user1.facebookId, {
        facebook_id: user2.facebookId
      }), mockRes(function(ower) {
        checkOwer1(ower);
        done();
      }, 201));
    });

    it('sends an ower request when creating a Facebook ower without a counterpart', function(done) {
      owers.create(mockReq(user1.facebookId, {
        facebook_id: user2.facebookId
      }), mockRes(function(ower) {
        OwerRequestModel.findOne({
          from: user1.facebookId,
          to: user2.facebookId
        }, function(err, owerRequest) {
          owerRequest.should.exist;
          done(err);
        });
      }, 201));
    });

    it('creates a Facebook ower with a counterpart ID', function(done) {
      owers.create(mockReq(user1.facebookId, {
        facebook_id: user2.facebookId
      }), mockRes(function(ower1) {
        owers.create(mockReq(user2.facebookId, {
          facebook_id: user1.facebookId
        }), mockRes(function(ower2) {
          checkOwer2(ower2);
          ower2.counterpart.should.exist;
          ower2.counterpart.toString().should.equal(ower1._id.toString());
          done();
        }, 201));
      }, 201));
    });

    it('updates the counterpart with a counterpart ID', function(done) {
      owers.create(mockReq(user1.facebookId, {
        facebook_id: user2.facebookId
      }), mockRes(function(ower1) {
        owers.create(mockReq(user2.facebookId, {
          facebook_id: user1.facebookId
        }), mockRes(function(ower2) {
          OwerModel.findOne({
            facebookId: user2.facebookId,
            tetheredTo: user1.facebookId
          }, function(err, ower) {
            checkOwer1(ower);
            ower.counterpart.should.exist;
            ower.counterpart.toString().should.equal(ower2._id.toString());
            done(err);
          });
        }, 201));
      }, 201));
    });

    it('removes the pending ower request', function(done) {
      owers.create(mockReq(user1.facebookId, {
        facebook_id: user2.facebookId
      }), mockRes(function(ower1) {
        owers.create(mockReq(user2.facebookId, {
          facebook_id: user1.facebookId
        }), mockRes(function(ower2) {
          OwerRequestModel.findOne({
            from: user1.facebookId,
            to: user2.facebookId
          }, function(err, owerRequest) {
            expect(owerRequest).to.not.exist;
            done(err);
          });
        }, 201));
      }, 201));
    });
  });
});
