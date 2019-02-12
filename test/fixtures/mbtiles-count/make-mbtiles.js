#!/usr/bin/env node
'use strict';

const Mbtiles = require('@mapbox/mbtiles');
const path = require('path');
const fs = require('fs');
const queue = require('queue-async');

const img = fs.readFileSync(path.resolve(__dirname, 'blue.png'));

module.exports = function(filepath, numTiles, callback) {
  let count = Number(numTiles);

  new Mbtiles(filepath, ((err, mbtiles) => {
    if (err) return err;
    mbtiles.startWriting((err) => {
      if (err) return err;
      mbtiles.putTile(0, 0, 0, img, (err) => {
        if (err) return err;
        count--;

        const q = queue(10);
        let x;
        let y;

        while (count) {
          x = Math.floor(Math.random() * 4194304);
          y = Math.floor(Math.random() * 4194304);
          q.defer(mbtiles.putTile.bind(mbtiles), 22, x, y, img);
          count--;
        }

        q.awaitAll((err) => {
          if (err) return callback(err);
          mbtiles.stopWriting((err) => {
            if (err) return callback(err);
            mbtiles.close((err) => {
              if (err) return callback(err);
              mbtiles = null;
              callback();
            });
          });
        });
      });
    });
  }));
};

if (require.main === module) {
  module.exports(process.argv[2], process.argv[3], (err) => {
    if (err) throw err;
    console.log('done');
  });
}
