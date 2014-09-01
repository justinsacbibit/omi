// Dependencies
var https      = require('https')
  , fs         = require('fs')
  , express    = require('express')
  , app        = express()
  , mongoose   = require('mongoose')
  , nodemailer = require('nodemailer')
  , path       = require('path')
  , api        = require('./api/app.js');

var port = process.env.PORT || process.env.SSL ? 443 : 8080;

// Load SSL Certificate
var options = {
  key:  fs.readFileSync('./sslcert/key.pem'),
  cert: fs.readFileSync('./sslcert/cert.pem')
}

// Serve homepage
app.use('/', express.static(path.join(__dirname, 'public')));

// REST API
api.use(express, app, mongoose, nodemailer);

var serverStart = function() {
  console.log('Server started on port %d', port);
};

if (process.env.NODE_ENV === 'production' || !process.env.SSL) {
  app.listen(port, serverStart);
} else {
  https.createServer(options, app).listen(port, serverStart);
}
