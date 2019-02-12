'use strict';
const assert = require('assert');
const crypto = require('crypto');
const path = require('path');
const queue = require('queue-async');

// The order here determines the order in which preprocessors will be run
// spatial-index.preprocessor must be last, since it must create an index file for the final preprocessed source
let preprocessors = [
  'tif-toBytes.preprocessor',
  'tif-reproject.preprocessor',
  'shp-index.preprocessor',
  'geojson-bom.preprocessor',
  'spatial-index.preprocessor',
  'togeojson-kml.preprocessor',
  'togeojson-gpx.preprocessor'
];

// Loads each *.preprocessor.js file and builds an array of them
// Throws errors if the file does not export a `criteria` and `preprocess`
// function
preprocessors = preprocessors.map((filename) => {
  const preprocessor = require(path.resolve(__dirname, filename));

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
  const q = queue();
  preprocessors.forEach((preprocessor) => {
    q.defer(preprocessor.criteria, filepath, info);
  });

  q.awaitAll((err, results) => {
    if (err) return callback(err);
    callback(null, preprocessors.filter((preprocessor, i) => {
      return !!results[i];
    }));
  });
}

// Just maps applicable preprocessors into a list of descriptions
function descriptions(filepath, info, callback) {
  applicable(filepath, info, (err, preprocessors) => {
    if (err) return callback(err);
    callback(null, preprocessors.map((preprocessor) => {
      return preprocessor.description;
    }));
  });
}

// A function that hands out a new filepath in the same directory as the given file
function newfile(filepath) {
  let dir = path.dirname(filepath);
  if (path.extname(filepath) === '.shp') dir = path.resolve(dir, '..');
  const name = crypto.randomBytes(8).toString('hex');
  return path.join(dir, name);
}

// Finds applicable preprocessors and runs each
// `info` is expected to be an fs.Stat object + .filetype determined by mapbox-file-sniff
// callback returns the post-preprocessed filepath
function preprocessorcery(infile, info, callback) {
  applicable(infile, info, (err, preprocessors) => {
    if (err) return callback(err);

    const q = queue(1);
    preprocessors.forEach((preprocessor) => {
      const outfile = newfile(infile);
      q.defer((next) => {
        preprocessor(infile, outfile, (err) => {
          if (err) return next(err);
          infile = outfile;
          next();
        });
      });
    });

    q.await((err) => {
      if (err) return callback(err);

      // infile has been changed to the output file by this point
      callback(null, infile);
    });
  });
}
