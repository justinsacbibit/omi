// Dependencies
var express    = require('express')
  , app        = express()
  , mongoose   = require('mongoose')
  , passport   = require('passport')
  , nodemailer = require('nodemailer')
  , path       = require('path')
  , api        = require('./api/app.js');

var port = process.env.PORT || 8080;

app.use('/', express.static(path.join(__dirname, 'public')));

// REST API
api.use(app, mongoose, passport, nodemailer);

app.listen(port, function() {
  console.log('Server started on port %s', port);
});
