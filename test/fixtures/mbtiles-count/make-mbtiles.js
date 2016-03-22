#!/usr/bin/env node

var Mbtiles = require('mbtiles');
var path = require('path');
var fs = require('fs');
var queue = require('queue-async');

var img = fs.readFileSync(path.resolve(__dirname, 'blue.png'));

module.exports = function(filepath, numTiles, callback) {
  var count = Number(numTiles);

  new Mbtiles(filepath, function(err, mbtiles) {
    if (err) return err;
    mbtiles.startWriting(function(err) {
      if (err) return err;
      mbtiles.putTile(0, 0, 0, img, function(err) {
        if (err) return err;
        count--;

        var q = queue(10);
        var x;
        var y;

        while (count) {
          x = Math.floor(Math.random() * 4194304);
          y = Math.floor(Math.random() * 4194304);
          q.defer(mbtiles.putTile.bind(mbtiles), 22, x, y, img);
          count--;
        }

        q.awaitAll(function(err) {
          if (err) return callback(err);
          mbtiles.stopWriting(function(err) {
            if (err) return callback(err);
            mbtiles.close(function(err) {
              if (err) return callback(err);
              mbtiles = null;
              callback();
            });
          });
        });
      });
    });
  });
};

if (require.main === module) {
  module.exports(process.argv[2], process.argv[3], function(err) {
    if (err) throw err;
    console.log('done');
  });
}
