var fs = require('fs');
var sniffer = require('mapbox-file-sniff');
var preprocessors = require('./preprocessors');
var parts = require('./parts');

module.exports = preprocess;

function preprocess(infile, callback) {
  var info;
  var descriptions;

  fs.stat(infile, getType);

  function getType(err, stats) {
    if (err) return callback(err);
    info = stats;
    sniffer.quaff(infile, function(err, type) {
      if (err) return callback(err);
      info.filetype = type;
      preprocessors.descriptions(infile, info, performPreprocessorcery);
    });
  }

  function performPreprocessorcery(err, result) {
    if (err) return callback(err);
    descriptions = result;
    preprocessors(infile, info, getParts);
  }

  function getParts(err, outfile) {
    if (err) return callback(err);

    parts(outfile, info, function(err, parts) {
      if (err) return callback(err);
      callback(null, outfile, parts, descriptions);
    });
  }
}
