'use strict';
const fs = require('fs');
const stream = require('stream');

module.exports = function(infile, outfile, callback) {
  let first = true;

  const strip = new stream.Transform();
  strip._transform = function(chunk, enc, callback) {
    chunk = first ? chunk.toString('utf8').substring(1) : chunk.toString('utf8');
    strip.push(chunk);
    first = false;
    callback();
  };

  fs.createReadStream(infile)
    .on('error', callback)
    .pipe(strip)
    .on('error', callback)
    .pipe(fs.createWriteStream(outfile))
    .on('error', callback)
    .on('finish', callback);
};

module.exports.description = 'Remove a byte-order-mark from a geojson string';

module.exports.criteria = function(infile, info, callback) {
  if (info.filetype !== 'geojson') return callback(null, false);

  fs.open(infile, 'r', (err, fd) => {
    if (err) return callback(err);
    const buf = new Buffer(3);
    fs.read(fd, buf, 0, 3, 0, (err) => {
      if (err) return callback(err);
      const strip = buf[0] === 0xef && buf[1] === 0xbb && buf[2] === 0xbf;
      fs.close(fd, (err) => {
        if (err) return callback(err);
        callback(null, strip);
      });
    });
  });
};
