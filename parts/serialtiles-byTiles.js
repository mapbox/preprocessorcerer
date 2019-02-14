'use strict';
const fs = require('fs');
const zlib = require('zlib');
const split = require('split');

module.exports = function(filepath, info, callback) {
  let count = 0;

  fs.createReadStream(filepath)
    .pipe(zlib.createGunzip())
    .once('error', callback)
    .pipe(split())
    .on('data', () => {
      count += 1;
    })
    .on('end', () => {
      callback(null, Math.min(50, Math.ceil(count / 200000)));
    });
};
