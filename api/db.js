exports.init = function(mongoose, mongoURI) {
  mongoose.connect(mongoURI);

  var db = mongoose.connection;
  db.on('error', function(err) {
    console.log('Failed to connect to MongoDB database: %s', err.message);
    process.exit(1);
  });
  db.on('open', function() {
    console.log('Connected to MongoDB database!');
  })
}
