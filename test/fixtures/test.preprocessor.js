module.exports = function(infile, outfile, callback) {
  callback();
};

module.exports.description = 'test preprocessor';

module.exports.criteria = function(infile, info, callback) {
  callback(null, false);
};
