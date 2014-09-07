exports.log = function(message) {
  if (process.env.DEBUG) {
    console.log(message);
  }
};
