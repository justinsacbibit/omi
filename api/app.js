var db         = require('./db.js')
  , mongoURI   = process.env.MONGOHQ_URL || 'mongodb://localhost:27017';

var middleware = require('./utils/middleware.js')
  , strategies = require('./strategies.js')
  , routes     = require('./routes.js')
  , debug      = require('./utils/debug.js');

debug.log('Admin ID: ' + process.env.ADMIN_ID);
debug.log('Admin secret: ' + process.env.ADMIN_SECRET);

exports.use = function(express, app, mongoose, passport, nodemailer) {
  db.init(mongoose, mongoURI);

  app.use(passport.initialize());
  strategies.init(passport);

  var isValidToken = passport.authenticate('bearer', {
    session: false
  });

  var isFbAuthorized = [
    isValidToken,
    middleware.validFacebookId,
    middleware.isOwnFacebookId
  ];

  app.use('/api/v1', routes.use(express.Router(), isValidToken, isFbAuthorized));
  app.use(middleware.notFound);
  app.use(middleware.internalError);
}
