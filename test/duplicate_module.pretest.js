'use strict';
const tape = require('tape');
const exec = require('child_process').exec;

const count_module = function(name, callback) {
  const cmd = 'npm ls ' + name;
  exec(cmd, (error, stdout) => {
    const pattern = new RegExp(name + '@', 'g');
    const match = stdout.match(pattern);
    if (!match) {
      return callback(null, 0);
    }

    return callback(null, match.length);
  });
};

[
  'mapnik',
  'sqlite3',
  'gdal',
  '@mapbox/tilelive',
  '@mapbox/mbtiles'
].forEach((mod) => {
  tape.test('there should only be one ' + mod + ' module, otherwise you are asking for pwnage', (t) => {
    count_module(mod, (err, count) => {
      if (err) throw err;
      t.notEqual(count, 0);
      t.equal(count, 1);
      t.end();
    });
  });
});
