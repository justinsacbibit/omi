var mongoose    = require('mongoose')
  , dbURI       = process.env.MONGO_TEST || 'mongodb://localhost:27018';

var clear = exports.clear = function(done) {
  mongoose.connect(dbURI, function() {
    mongoose.connection.db.dropDatabase(function(err) {
      done(err);
    });
  });
};
