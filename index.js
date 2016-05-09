var fs = require('fs');
var sniffer = require('mapbox-file-sniff');
var preprocessors = require('./preprocessors');
var parts = require('./parts');

module.exports = preprocess;

function preprocess(infile, callback) {
  var info;
  var descriptions;

  fs.stat(infile, getType);

  function fail(err) {
    err = err || new Error('Any unspecified error was encountered');
    if (err && err.code === 'EINVALID') return callback(null, false, err.message);
    return callback(err);
  }

  function getType(err, stats) {
    if (err) return fail(err);
    info = stats;
    sniffer.quaff(infile, function(err, type) {
      if (err) return fail(err);
      info.filetype = type;
      preprocessors.descriptions(infile, info, performPreprocessorcery);
    });
  }

  function performPreprocessorcery(err, result) {
    if (err) return fail(err);
    descriptions = result;
    preprocessors(infile, info, getParts);
  }

  function getParts(err, outfile) {
    if (err) return fail(err);

    parts(outfile, info, function(err, parts) {
      if (err) return fail(err);
      callback(null, true, null, outfile, parts, descriptions);
    });
  }
}
