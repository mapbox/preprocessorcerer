'use strict';
const Mbtiles = require('@mapbox/mbtiles');

module.exports = function splitBySize(filepath, info, callback) {
  new Mbtiles(filepath, ((err, src) => {
    if (err) return callback(err);

    src._db.get('SELECT COUNT(1) AS count FROM tiles', (err, tilesResult) => {
      const re = new RegExp('no such table: tiles');
      if (err && re.test(err.message)) {
        tilesResult = { count: 0 };
      }
      else if (err) return callback(err);

      src._db.get('SELECT COUNT(1) AS count FROM grids', (err, gridsResult) => {
        const re = new RegExp('no such table: grids');
        if (err && re.test(err.message)) {
          gridsResult = { count: 0 };
        }
        else if (err) return callback(err);

        src.close((err) => {
          if (err) return callback(err);
          src = null;
          const maxTilesPerJob = 100000;
          const result = tilesResult.count + gridsResult.count;
          if (!result) return callback(new Error('no tiles or grids'));

          callback(null, Math.min(50, Math.ceil(result / maxTilesPerJob)));
        });
      });
    });
  }));
};
