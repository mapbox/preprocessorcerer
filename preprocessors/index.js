var assert = require('assert');
var crypto = require('crypto');
var path = require('path');
var queue = require('queue-async');

// The order here determines the order in which preprocessors will be run
var preprocessors = [
  'tif-corrupt.preprocessor',
  'tif-toBytes.preprocessor',
  'tif-reproject.preprocessor',
  'shp-index.preprocessor',
  'geojson-bom.preprocessor'
];

// Loads each *.preprocessor.js file and builds an array of them
// Throws errors if the file does not export a `criteria` and `preprocess`
// function
preprocessors = preprocessors.map(function(filename) {
  var preprocessor = require(path.resolve(__dirname, filename));

  assert.equal(typeof preprocessor.criteria, 'function', filename + ' should expose criteria function');
  assert.equal(typeof preprocessor.description, 'string', filename + ' should expose a description');
  assert.equal(typeof preprocessor, 'function', filename + ' should expose a preprocessor');

  return preprocessor;
});

module.exports = preprocessorcery;
module.exports.preprocessors = preprocessors;
module.exports.applicable = applicable;
module.exports.descriptions = descriptions;

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

// Just maps applicable preprocessors into a list of descriptions
function descriptions(filepath, info, callback) {
  applicable(filepath, info, function(err, preprocessors) {
    if (err) return callback(err);
    callback(null, preprocessors.map(function(preprocessor) {
      return preprocessor.description;
    }));
  });
}

// A function that hands out a new filepath in the same directory as the given file
function newfile(filepath) {
  var dir = path.dirname(filepath);
  if (path.extname(filepath) === '.shp') dir = path.resolve(dir, '..');
  var name = crypto.randomBytes(8).toString('hex');
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
