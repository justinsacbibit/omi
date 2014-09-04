var db         = require('./db.js')
  , mongoURI   = process.env.MONGOHQ_URL || 'mongodb://localhost:27017';

var middleware = require('./middleware.js')
  , strategies = require('./strategies.js')
  , routes     = require('./routes.js');

exports.use = function(express, app, mongoose, passport, nodemailer) {
  db.init(mongoose, mongoURI);

  app.use(passport.initialize());
  strategies.init(passport);

  var token = passport.authenticate('bearer', {
    session: false
  });

  app.use('/api/v1', routes.use(express.Router(), passport, middleware.ownership(), token));
  app.use(middleware.notFound());
}
