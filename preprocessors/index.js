var fs = require('fs'),
    crypto = require('crypto'),
    path = require('path'),
    queue = require('queue-async'),
    files = fs.readdirSync(__dirname),
    preprocessors = [];

module.exports = preprocessorcery;
module.exports.preprocessors = preprocessors;
module.exports.applicable = applicable;

// Loads each *.preprocessor.js file and builds an array of them
// Throws errors if the file does not export a `criteria` and `preprocess`
// function
files.forEach(function(filename) {
  if (!/^.*\.preprocessor\.js$/.test(filename)) return;
  var preprocessor = require(path.join(__dirname, filename));
  if (
    typeof preprocessor.criteria === 'function' &&
    typeof preprocessor === 'function'
  ) return preprocessors.push(preprocessor);

  throw new Error(filename + ' does not appear to be a valid preprocessor');
});

// A function that checks a file against each preprocessor's criteria
// callback returns only those applicable to this file
function applicable(filepath, info, callback) {
  var q = queue();
  preprocessors.forEach(function(preprocessor) {
    q.defer(preprocessor.criteria, filepath, info);
  });
  q.awaitAll(function(err, results) {
    if (err) return callback(err);
    callback(null, preprocessors.filter(function(preprocessor, i) {
      return !!results[i];
    }));
  });
}

// A function that hands out a new filepath in the same directory as the given file
function newfile(filepath) {
  var dir = path.dirname(filepath),
      name = crypto.randomBytes(8).toString('hex');
  return path.join(dir, name);
}

// Finds applicable preprocessors and runs each
// `info` is expected to be an fs.Stat object + .filetype determined by mapbox-file-sniff
// callback returns the post-preprocessed filepath
function preprocessorcery(infile, info, callback) {
  applicable(infile, info, function(err, preprocessors) {
    if (err) return callback(err);

    var q = queue(1);
    preprocessors.forEach(function(preprocessor) {
      var outfile = newfile(infile);
      q.defer(function(next) {
        preprocessor(infile, outfile, function(err) {
          if (err) return next(err);
          infile = outfile;
          next();
        });
      });
    });
    q.await(function(err) {
      if (err) return callback(err);
      // infile has been changed to the output file by this point
      callback(null, infile);
    });
  });
}
