var Mbtiles = require('mbtiles');

module.exports = function splitBySize(filepath, info, callback) {
  new Mbtiles(filepath, function(err, src) {
    if (err) return callback(err);

    src._db.get('SELECT COUNT(1) AS count FROM tiles', function(err, result) {
      if (err) return callback(err);

      var maxTilesPerJob = 100000;

      callback(null, Math.min(50, Math.ceil(result.count / maxTilesPerJob)));
    });
  });
};
