var fs = require('fs');
var zlib = require('zlib');
var split = require('split');

module.exports = function(filepath, info, callback) {
  var count = 0;

  fs.createReadStream(filepath)
    .pipe(zlib.createGunzip())
    .once('error', callback)
    .pipe(split())
    .on('data', function() {
      count += 1;
    })
    .on('end', function() {
      callback(null, Math.min(50, Math.ceil(count / 200000)));
    });
};
