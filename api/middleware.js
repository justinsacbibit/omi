function notFound(req, res, next) {
  res.status(404)
  console.log('Not found URL: %s',req.url)
  res.send({ error: 'Not found' })
}

exports.notFound = function() {
  return notFound;
}
