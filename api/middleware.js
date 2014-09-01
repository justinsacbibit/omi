var checkAPIKey = function(req, res, next) {
  var apikey = (req.body && req.body.apikey) || (req.query && req.query.apikey) || req.headers['x-apikey'];

  if (!apikey) {
    return res.status(401).end('API Key required');
  }

  if (apikey == process.env.MOBILE_API_KEY) {
    return next();
  }

  if (apikey == process.env.WEB_API_KEY) {
    return next();
  }

  return res.status(401).end('Invalid API key');
};

exports.apikey = function() {
  return checkAPIKey;
};

function notFound(req, res, next) {
  res.status(404)
  console.log('Not found URL: %s',req.url)
  res.send({ error: 'Not found' })
}

exports.notFound = function() {
  return notFound;
}
