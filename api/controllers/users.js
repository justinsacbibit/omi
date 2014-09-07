var crypto           = require('crypto')
  , UserModel        = require('../models/people/user.js').UserModel
  , AccessTokenModel = require('../models/auth/accessToken.js').AccessTokenModel
  , fb               = require('../fb.js')
  , error            = require('../utils/error.js')
  , paginate         = require('../utils/paginate.js');

var ClientErrors     = require('../models/errors/client.js')
  , NotFoundError    = ClientErrors.NotFoundError;

var FBErrors         = require('../models/errors/fb.js')
  , FBError          = FBErrors.FBError;

var ascending = function(key) {
  return function(a, b) {
    if (a[key] < b[key]) {
      return -1;
    } else if (a[key] > b[key]) {
      return 1;
    }
    return 0;
  };
};

exports.login = function(req, res) {
  var fbAccessToken = req.body.fb_access_token;

  var fbToken, facebookId, user;

  fb.login(fbAccessToken)
  .then(function(aFbToken) {
    fbToken = aFbToken;
    facebookId = fbToken.facebookId;

    return UserModel.findOneAsync({
      facebookId: facebookId,
      type:       'user'
    });
  })
  .then(function(aUser) {
    if (!aUser) {
      return fb.name(fbToken.token)
      .then(function(name) {
        user = new UserModel({
          name:       name,
          facebookId: facebookId,
          fbToken:    [fbToken]
        });

        return user.saveAsync();
      });
    }

    user = aUser;
    user.fbToken = [fbToken];
    return user.saveAsync();
  })
  .then(function() {
    return AccessTokenModel.findOneAsync({
      clientId:   req.client.clientId,
      facebookId: facebookId,
      type:       'user'
    });
  })
  .then(function(token) {
    var tokenValue = crypto.randomBytes(32).toString('base64');

    if (!token) {
      token = new AccessTokenModel({
        token:      tokenValue,
        clientId:   req.client.clientId,
        facebookId: facebookId
      });

      return token.saveAsync();
    }

    token.token = tokenValue;
    token.created = Date.now();
    return token.saveAsync();
  })
  .then(function(token) {
    res.status(201).json({
      token: {
        access_token: token[0].token,
        expires:      process.env.TOKEN_LIFE
      },
      user: {
        facebook_id: facebookId,
        name:        user.name
      }
    });
  })
  .catch(FBError, error.gatewayHandler(res))
  .catch(error.serverHandler(res));
};

exports.logout = function(req, res) {
  var clientId   = req.client.clientId
    , facebookId = req.user.facebookId;

  AccessTokenModel.findOneAndRemoveAsync({
    clientId:   clientId,
    facebookId: facebookId,
    type:       'user'
  })
  .then(function(accessToken) {
    if (!accessToken) {
      throw new Error('Invalid access token');
    }

    res.json({
      success: true
    });
  })
  .catch(error.serverHandler);
};

exports.info = function(req, res) {
  res.json({
    facebook_id: req.user.facebookId,
    name:        req.user.name
  });
};

exports.all = function(req, res) {
  UserModel.findAsync({
    type: 'user'
  })
  .then(function(users) {
    res.json(users);
  })
  .catch(error.serverHandler(res));
};

exports.show = function(req, res) {
  var facebookId = parseInt(req.param('facebook_id'));

  UserModel.findOneAsync({
    facebookId: facebookId,
    type:       'user'
  })
  .then(function(user) {
    if (!user) {
      throw new NotFoundError('User not found');
    }

    res.json(user);
  })
  .catch(NotFoundError, error.notFoundHandler(res))
  .catch(error.serverHandler(res));
};

exports.allFriends = function(req, res) {
  var fbToken    = req.user.fbToken[0]
    , facebookId = req.user.facebookId
    , name       = req.query.name
    , offset     = req.query.offset
    , limit      = req.query.limit;

  var conditions = {
    facebookId: facebookId
  };

  if (!paginate(req, res, conditions)) {
    return;
  }

  fb.friends(fbToken)
  .then(function(data) {
    if (!data) {
      throw new FBError('Data not returned from Facebook');
    }

    var friends    = data.users
      , totalCount = data.totalCount;

    if (!friends) {
      throw new FBError('Friends not returned from Facebook');
    }

    if (name) {
      friends = friends.filter(function(element) {
        var fullFriendName = element.name;
        return fullFriendName.indexOf(name) > -1;
      });
    }

    friends = friends.sort(ascending('name'));

    if (offset && limit) {
      friends = friends.slice(offset, offset + limit);
    }

    var JSON = {
      friends:     friends,
      total_count: totalCount
    };

    res.json(JSON);
  })
  .catch(FBError, error.gatewayHandler(res))
  .catch(error.serverHandler(res));
};
