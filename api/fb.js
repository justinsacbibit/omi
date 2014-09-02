/**
 * Error codes for callbacks
 * 1   = Insufficient permissions
 * 2   = Token expired
 */

var rest         = require('restler')
  , crypto       = require('crypto')
  , FBTokenModel = require('./model/auth/fbToken.js').FBTokenModel
  , querystring  = require('querystring');

var logError = function(functionName, failure, err) {
  console.log('fb.js: ' + functionName + ': ' + failure + ': err');
};

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
    'input_token':  fbAccessToken,
    'access_token': process.env.APP_ID + '|' + process.env.APP_TOKEN
  });

  rest.get(URL).on('complete', function(data) {
    if (typeof data === Error) {
      return done(data);
    }

    if (data['error']) {
      return done(null, false, {
        message: data['error']['message']
      });
    }

    data = data['data'];

    var facebookId = parseInt(data['user_id'])
      , app_id     = data['app_id']
      , scopes     = data['scopes'];

    if (app_id !== process.env.APP_ID) {
      return done(null, false, {
        message: 'App ID does not match'
      });
    }

    if (typeof facebookId !== 'number') {
      return done(null, false, {
        message: 'User ID not returned in response'
      });
    }

    URL = URLBuilder('/oauth/access_token', {
      'client_id':         process.env.APP_ID,
      'client_secret':     process.env.APP_TOKEN,
      'grant_type':        'fb_exchange_token',
      'fb_exchange_token': fbAccessToken
    });

    rest.get(URL).on('complete', function(data) {
      if (typeof data === Error) {
        return done(data);
      }

      if (data['error']) {
        return done(null, false, {
          message: data['error']['message']
        });
      }

      data = querystring.parse(data);

      var longLivedFbAccessToken = data['access_token']
        , expires                = Date.now() + parseInt(data['expires']);

      FBTokenModel.findOne({
        facebookId: facebookId
      }, function(err, fbToken) {
        if (err) {
          logError('login', 'FBTokenModel.findOne', err);
          return done(err);
        }

        if (!fbToken) {
          fbToken = new FBTokenModel({
            facebookId: facebookId,
            token:      longLivedFbAccessToken,
            scopes:     scopes,
            expires:    expires
          });

          return fbToken.save(function(err) {
            if (err) {
              logError('login', 'FBTokenModel.save', err);
              return done(err);
            }

            return done(null, facebookId);
          });
        }
        fbToken.token   = longLivedFbAccessToken;
        fbToken.scopes  = scopes;
        fbToken.expires = expires;

        fbToken.save(function(err) {
          if (err) {
            logError('login', 'FBTokenModel.save', err);
            return done(err);
          }

          return done(null, facebookId);
        });
      });
    });
  });
};

exports.name = function(fbAccessToken, done) {
  URL = URLBuilder('/me', {
    'access_token': fbAccessToken
  });

  rest.get(URL).on('complete', function(data) {
    if (typeof data === Error) {
      return done(data);
    }

    if (data['error']) {
      return done(null, false, {
        message: data['error']['message']
      });
    }

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
};

exports.expired = function(fbToken) {
  return (fbToken.expires - Date.now()) < 0;
}

exports.needPermissions = function(fbToken, permission) {
  return fbToken.scopes.indexOf(permission) <= -1;
}

exports.friends = function(facebookId, done) {
  var hmac = crypto.createHmac('sha256', process.env.APP_TOKEN);
  hmac.update(fbToken.token);
  var appSecretProof = hmac.digest('hex');

  URL = URLBuilder('/me/friends', {
    'access_token':    fbToken.token,
    'appsecret_proof': appSecretProof
  });

  rest.get(URL).on('complete', function(data) {
    console.log(data)
    if (typeof data === Error) {
      return done(data);
    }

    if (data['error']) {
      return done(null, false, false, {
        message: data['error']['message']
      });
    }

    var users      = data['data']
      , totalCount = data['summary']['total_count'];

    if (!users) {
      return done(null, false, false, {
        message: 'No data provided in response'
      });
    }

    if (!totalCount) {
      console.log('Total users not provided in response');
    }

    return done(null, users, totalCount);
  });
};
