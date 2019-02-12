'use strict';
const fs = require('fs');
const sniffer = require('@mapbox/mapbox-file-sniff');
const preprocessors = require('./preprocessors');
const parts = require('./parts');

module.exports = preprocess;

function preprocess(infile, callback) {
  let info;
  let descriptions;

  fs.stat(infile, getType);

  function fail(err) {
    err = err || new Error('Any unspecified error was encountered');
    if (err && err.code === 'EINVALID') return callback(null, false, err.message);
    return callback(err);
  }

  function getType(err, stats) {
    if (err) return fail(err);
    info = stats;
    sniffer.fromFile(infile, (err, fileinfo) => {
      if (err) return fail(err);
      info.filetype = fileinfo.type;
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

    parts(outfile, info, (err, parts) => {
      if (err) return fail(err);
      callback(null, true, null, outfile, parts, descriptions);
    });
  }
}
