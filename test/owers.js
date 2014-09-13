var _ = require('underscore')
  , db = require('./support/db.js')
  , error = require('./support/error.js')
  , controller = require('./support/controller.js')
  , UserModel = require('../api/models/people/user.js').UserModel
  , OwerModel = require('../api/models/people/ower.js').OwerModel
  , OwerRequestModel = require('../api/models/requests/owerRequest.js').OwerRequestModel
  , owers = require('../api/controllers/owers.js');

var dict = function dict(name, facebookId, tetheredTo) {
  return {
    name: name,
    facebookId: facebookId,
    tetheredTo: tetheredTo
  };
};

var user1 = dict('user1name', 54321);
var user2 = dict('user2name', 23456);
var user3 = dict('user3name', 1234563)
var ower1 = dict('ower1name', null, user1.facebookId);
var fbOwer1 = dict('user1name', 1234563, user2.facebookId);

var initModels = function initModels(models, model) {
  var users = _.map(models, function(el) {
    return new model(el);
  });

  return users;
};

var people = function people() {
  var users = initModels([user1, user2], UserModel);
  var owers = initModels([ower1, fbOwer1], OwerModel);
  return users.concat(owers);
};

var mockReq = function(params, facebookId, owerId) {
  return {
    param: function(param) {
      if (param === 'facebook_id') {
        return facebookId;
      } else if (param === 'ower_id') {
        return owerId;
      }

      return null;
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
  if (facebookId) {
    ower.should.have.property('facebookId', facebookId);
  }
  ower.should.have.property('tetheredTo', tetheredTo);
  ower.should.have.property('type', 'ower');
  ower.should.have.property('balance', 0);
};

var checkOwer1 = function checkOwer1(ower) {
  checkOwer(ower, ower1.name, null, user1.facebookId);
};

var checkFbOwer1 = function checkFbOwer1(ower) {
  checkOwer(ower, user1.name, user1.facebookId, user2.facebookId);
};

describe('owers', function() {
  beforeEach(function(done) {
    db.clear();
    done();
  });

  afterEach(function(done) {
    db.clear();
    done();
  });

  describe('#all()', function() {
    beforeEach(function(done) {
      save(people(), function(err) {
        done(err);
      });
    });

    it('does not return users', function(done) {
      owers.all(mockReq({}), mockRes(function(owers) {
        owers.should.all.not.have.property('type', 'user');
        done();
      }));
    });

    it('only returns owers', function(done) {
      owers.all(mockReq({}), mockRes(function(owers) {
        owers.should.all.have.property('type', 'ower');
        done();
      }));
    });

    it('can return all owers', function(done) {
      owers.all(mockReq({}), mockRes(function(owers) {
        owers.should.have.length(2);
        done();
      }));
    });

    it('can filter by name', function(done) {
      owers.all(mockReq({
        name: 'ower'
      }), mockRes(function(owers) {
        owers.should.have.length(1);
        owers[0].name.should.equal(ower1.name);
        done();
      }));
    });

    it('returns an error with invalid pagination parameters', function(done) {
      owers.all(mockReq({
        limit: 0
      }), mockRes(function(err) {
        error.checkResponse(err);
        done();
      }, 400));
    });

    it('can filter by Facebook ID', function(done) {
      owers.all(mockReq({
        facebook_id: fbOwer1.facebookId
      }), mockRes(function(owers) {
        owers.should.have.length(1);
        owers[0].name.should.equal(fbOwer1.name);
        done();
      }));
    });

    it('can retrieve owers tethered to a Facebook ID', function(done) {
      owers.all(mockReq({}, user2.facebookId), mockRes(function(owers) {
        owers.should.have.length(1);
        owers.should.include.a.thing.with.property('name', fbOwer1.name);
        done();
      }));
    });
  });

  describe('#create()', function() {
    beforeEach(function(done) {
      save(initModels([user1, user2], UserModel), function(err) {
        done(err);
      });
    });

    it('returns an error if the request contains a name and Facebook ID at the same time', function(done) {
      owers.create(mockReq({
        name: 'name',
        facebook_id: 'facebookId'
      }), mockErrorRes(400, done));
    });

    it('returns an error if the ower is self', function(done) {
      var facebookId = 12345;
      owers.create(mockReq({
        facebook_id: facebookId
      }, facebookId), mockErrorRes(400, done));
    });

    it('returns an error if no parameters are provided', function(done) {
      owers.create(mockReq({}), mockErrorRes(400, done));
    });

    it('creates a non-Facebook ower', function(done) {
      var name = 'Non-Facebook Ower';
      owers.create(mockReq({
        name: name
      }, user1.facebookId), mockRes(function(ower) {
        ower.should.have.property('name', name);
        ower.should.have.property('tetheredTo', user1.facebookId);
        ower.should.have.property('type', 'ower');
        ower.should.have.property('balance', 0);
        done();
      }, 201));
    });

    it('returns an error for an existing ower', function(done) {
      var name = 'Non-Facebook Ower';
      var mockRequest = mockReq({
        name: name
      }, user1.facebookId);
      owers.create(mockRequest, mockRes(function(ower) {
        owers.create(mockRequest, mockErrorRes(409, done));
      }, 201));
    });

    it('returns an error when adding a non-existing Facebook ower', function(done) {
      owers.create(mockReq({
        facebook_id: 9183756371
      }, user1.facebookId), mockErrorRes(404, done));
    });

    it('creates a Facebook ower without a counterpart', function(done) {
      owers.create(mockReq({
        facebook_id: user2.facebookId
      }, user1.facebookId), mockRes(function(ower) {
        checkOwer(ower, user2.name, user2.facebookId, user1.facebookId);
        done();
      }, 201));
    });

    it('sends an ower request when creating a Facebook ower without a counterpart', function(done) {
      owers.create(mockReq({
        facebook_id: user2.facebookId
      }, user1.facebookId), mockRes(function(ower) {
        OwerRequestModel.findOne({
          from: user1.facebookId,
          to: user2.facebookId
        }, function(err, owerRequest) {
          owerRequest.from.should.equal(user1.facebookId);
          owerRequest.to.should.equal(user2.facebookId);
          done(err);
        });
      }, 201));
    });

    it('creates a Facebook ower with a counterpart ID', function(done) {
      owers.create(mockReq({
        facebook_id: user2.facebookId
      }, user1.facebookId), mockRes(function(ower1) {
        owers.create(mockReq({
          facebook_id: user1.facebookId
        }, user2.facebookId), mockRes(function(ower2) {
          checkFbOwer1(ower2);
          ower2.counterpart.toString().should.equal(ower1._id.toString());
          done();
        }, 201));
      }, 201));
    });

    it('updates the counterpart with a counterpart ID', function(done) {
      owers.create(mockReq({
        facebook_id: user2.facebookId
      }, user1.facebookId), mockRes(function(ower1) {
        owers.create(mockReq({
          facebook_id: user1.facebookId
        }, user2.facebookId), mockRes(function(ower2) {
          OwerModel.findOne({
            facebookId: user2.facebookId,
            tetheredTo: user1.facebookId
          }, function(err, ower) {
            checkOwer(ower, user2.name, user2.facebookId, user1.facebookId);
            ower.counterpart.toString().should.equal(ower2._id.toString());
            done(err);
          });
        }, 201));
      }, 201));
    });

    it('removes the pending ower request', function(done) {
      owers.create(mockReq({
        facebook_id: user2.facebookId
      }, user1.facebookId), mockRes(function(ower1) {
        owers.create(mockReq({
          facebook_id: user1.facebookId
        }, user2.facebookId), mockRes(function(ower2) {
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

  describe('#show()', function() {
    beforeEach(function(done) {
      save(people(), function(err) {
        done(err);
      });
    });

    it('returns an error for an invalid ower ID', function(done) {
      owers.show(mockReq({}, user1.facebookId, 'someowerid'), mockErrorRes(400, done));
    });

    it('returns an error for a non-existent ower ID', function(done) {
      owers.show(mockReq({}, user1.facebookId, '54135860e3617eeb2ed0e5a4'), mockErrorRes(404, done));
    });

    it('retrieves the correct ower', function(done) {
      OwerModel.findOne({
        name: ower1.name,
        tetheredTo: user1.facebookId
      }, function(err, ower) {
        owers.show(mockReq({}, user1.facebookId, ower._id), mockRes(function(ower) {
          checkOwer1(ower);
          done();
        }));
      });
    });
  });
});
