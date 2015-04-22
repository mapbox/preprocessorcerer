var MBTiles = require('mbtiles');
var queue = require('queue-async');
var fs = require('fs');

module.exports = function(infile, outfile, callback) {
  fs.createReadStream(infile)
    .pipe(fs.createWriteStream(outfile))
    .on('finish', cleanup);

  function cleanup() {
    new MBTiles(outfile, function(err, mbtiles) {
      if (err) return callback(err);
      var db = mbtiles._db;

      queue(1)
        .defer(function(next) {
          mbtiles.startWriting(next);
        })
        .defer(function(next) {
          db.get('DELETE from map where tile_id is null;', next);
        })
        .defer(function(next) {
          db.get('VACUUM;', next);
        })
        .defer(function(next) {
          mbtiles.close(next);
        })
        .awaitAll(callback);
    });
  }
};

module.exports.description = 'Clean out usless mbtiles data';

module.exports.criteria = function(infile, info, callback) {
  if (info.filetype !== 'mbtiles') return callback(null, false);
  callback(null, true);
};
