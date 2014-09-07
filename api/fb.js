/**
 * Error codes for callbacks
 * 1   = Insufficient permissions
 * 2   = Token expired
 */

var request      = require('request')
  , Promise      = require('bluebird')
  , crypto       = require('crypto')
  , querystring  = require('querystring')
  , FBTokenModel = require('./models/auth/fbToken.js').FBTokenModel
  , debug        = require('./utils/debug.js')
  , error        = require('./utils/error.js')
  , FBErrors     = require('./models/errors/fb.js')
  , FBError      = FBErrors.FBError;

Promise.longStackTraces();
Promise.promisifyAll(request);

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
};

var appSecretProof = function(fbAccessToken) {
  var hmac = crypto.createHmac('sha256', process.env.APP_SECRET);
  hmac.update(fbAccessToken);
  var appSecretProof = hmac.digest('hex');
  return appSecretProof;
};

exports.login = function(fbAccessToken) {
  var URL = URLBuilder('/debug_token', {
    'input_token':  fbAccessToken,
    'access_token': process.env.APP_TOKEN
  });

  var facebookId, scopes;

  return request.getAsync(URL)
  .then(function(response) {
    var data = JSON.parse(response[1]);
    debug.log(data);

    var err = data.error || (data.data && data.data.error);
    if (err) {
      throw new FBError(err.message);
    }

    data = data.data;

    if (!data.user_id) {
      throw new FBError('Facebook did not return user_id in response');
    }

    var app_id = data.app_id
    facebookId = parseInt(data.user_id);
    scopes     = data.scopes;

    if (app_id !== process.env.APP_ID) {
      debug.log('Wrong app ID');
      debug.log('Data: ' + data);

      throw new FBError('Facebook app ID does not match');
    }

    if (isNaN(facebookId)) {
      debug.log('Facebook ID has the wrong type');
      debug.log('Data: ' + data);

      throw new FBError('Facebook returned ID that is not a number');
    }

    URL = URLBuilder('/oauth/access_token', {
      'client_id':         process.env.APP_ID,
      'client_secret':     process.env.APP_SECRET,
      'grant_type':        'fb_exchange_token',
      'fb_exchange_token': fbAccessToken
    });

    return request.getAsync(URL);
  })
  .then(function(response) {
    var data = response[1];
    debug.log(data);

    if (data.error) {
      throw new FBError('Facebook returned error in response');
    }

    data = querystring.parse(data);

    var longLivedFbAccessToken = data.access_token
      , expires                = Date.now() + parseInt(data.expires);

    var fbToken = new FBTokenModel({
      facebookId: facebookId,
      token:      longLivedFbAccessToken,
      scopes:     scopes,
      expires:    expires
    });

    return fbToken;
  });
};

exports.name = function(fbAccessToken) {
  URL = URLBuilder('/me', {
    'access_token':    fbAccessToken,
    'appsecret_proof': appSecretProof(fbAccessToken)
  });

  return request.getAsync(URL)
  .then(function(response) {
    console.log(JSON.parse(response[0].toJSON().body).id)
    var data = JSON.parse(response[0].toJSON().body);
    debug.log('Data for /me response: ' + data);

    var err = data.error || (data.data && data.data.error);
    if (err) {
      throw new FBError(err.message);
    }

    var name = data.first_name + ' ' + data.last_name;
    return name;
  });
};

exports.expired = function(fbToken) {
  if (process.env.DEBUG) {
    console.log('FB token ' + fbToken.token + ' expires in ' + (fbToken.expires - Date.now()) + ' seconds.');
    console.log('(fbToken.expires: ' + Math.round(fbToken.expires) + ', Date.now(): ' + Date.now());
    console.log('Expired: ' + fbToken.expires <= Date.now());
  }
  return fbToken.expires <= Date.now();
}

exports.needPermissions = function(fbToken, permission) {
  return fbToken.scopes.indexOf(permission) <= -1;
}

exports.friends = function(fbToken) {
  URL = URLBuilder('/me/friends', {
    'access_token':    fbToken.token,
    'appsecret_proof': appSecretProof(fbToken.token)
  });

  return request.getAsync(URL)
  .then(function(response) {
    var data = JSON.parse(response[1]);
    debug.log('Data for /me/friends response: ' + data);

    var err = data.error || data.data.error;
    if (err) {
      throw new FBError(err.message);
    }

    var users      = data.data
      , totalCount = data.summary.total_count;

    if (!users) {
      throw new FBError('Facebook provided empty friend response');
    }

    return {
      users:      users,
      totalCount: totalCount
    };
  });
};
