/**
 * ENVIRONMENT VARIABLES
 * TOKEN_LIFE: Number of seconds before a token expires
 * APP_TOKEN: Facebook app token
 * APP_ID: Facebook app ID
 * ADMIN_ID: Client ID for admin program
 * ADMIN_SECRET: Client secret for admin program
 */

// Dependencies
var https      = require('https')
  , fs         = require('fs')
  , express    = require('express')
  , app        = express()
  , bodyParser = require('body-parser')
  , mongoose   = require('mongoose')
  , passport   = require('passport')
  , nodemailer = require('nodemailer')
  , path       = require('path')
  , api        = require('./api/app.js');

var port = process.env.PORT || process.env.SSL ? 443 : 8080;

app.use(bodyParser.urlencoded({
  extended: true
}));

// Serve homepage
app.use('/', express.static(path.join(__dirname, 'public')));

// REST API
api.use(express, app, mongoose, passport, nodemailer);

var serverStart = function() {
  console.log('Server started on port %d', port);
};

if (process.env.NODE_ENV === 'production' || !process.env.SSL) {
  app.listen(port, serverStart);
} else {
  // Load SSL Certificate
  var options = {
    key:  fs.readFileSync('./sslcert/key.pem'),
    cert: fs.readFileSync('./sslcert/cert.pem')
  }
  https.createServer(options, app).listen(port, serverStart);
}
