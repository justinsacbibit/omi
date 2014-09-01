var rest         = require('restler')
  , FBTokenModel = require('./model/auth/fbToken.js').FBTokenModel;

var queryBuilder = function(params) {
  var queryString = '?';
  for (var propertyName in params) {
    if (queryString.length > 1) {
      queryString += '&';
    }
    queryString += propertyName;
    queryString += '=';
    queryString += params[propertyName];
  }
  return queryString;
};

var URLBuilder = function(endpoint, params) {
  return 'https://graph.facebook.com' + endpoint + queryBuilder(params);
}

exports.login = function(fbAccessToken, done) {
  var URL = URLBuilder('/debug_token', {
    'input_token': fbAccessToken,
    'access_token': process.env.APP_TOKEN
  })

  rest.get(URL).on('complete', function(data) {
    if (typeof data === Error) {
      return done(data);
    }

    if (data['error']) {
      return done(null, false, {
        message: data['error']['message']
      });
    }

    var facebookId = data['user_id']
      , scopes     = data['scopes']
      , expires    = data['expires_at'];

    if (data['app_id'] !== process.env.APP_ID) {
      return done(null, false, {
        message: 'App ID does not match'
      });
    }

    if (data['scopes'].indexOf('user_id') < 0) {
      return done(null, false, {
        message: 'User ID not returned in response'
      });
    }
    var fbToken = new FBTokenModel({
      facebookId: facebookId,
      token:      fbAccessToken,
      scopes:     scopes,
      expires:    expires
    });

    var upsertData = fbToken.toObject();
    delete upsertData._id;

    fbToken.update({
      facebookId: data['user_id']
    }, upsertData, {
      upsert: true
    }, function(err) {
      if (err) {
        return done(err);
      }

      return done(null, facebookId);
    });
  });
};

exports.name = function(fbAccessToken, done) {
  URL = URLBuilder('/me', {
    'access_token': fbAccessToken
  });

  rest.get(URL).on('complete', function(data) {
    if (!data['last_name']) {
      console.log('Warning: last name not returned in Facebook response for %d', facebookId);
    }

    if (!data['first_name']) {
      return done(null, false, {
        message: 'First name not returned in response for ' + facebookId
      });
    }

    var name = data['first_name'] + ' ' + data['last_name'];
    return done(null, name);
  });
}
