// Dependencies
var express    = require('express')
  , app        = express()
  , mongoose   = require('mongoose')
  , passport   = require('passport')
  , nodemailer = require('nodemailer')
  , ejs        = require('ejs')
  , path       = require('path')
  , api        = require('./api/app.js');

var port = process.env.PORT || 8080;

// Render the homepage
app.engine('html', ejs.renderFile);
app.use(express.static(path.join(__dirname, 'public')));
app.get('/', function(req, res) {
  res.render('index.html');
});

// REST API
api.use(app, mongoose, passport, nodemailer);

app.listen(port, function() {
  console.log('Server started on port %s', port);
});
