'use strict';
const test = require('tape');
const splitToParts = require('../parts');
const fs = require('fs');
const os = require('os');
const path = require('path');
const crypto = require('crypto');
const makeMbtiles = require('./fixtures/mbtiles-count/make-mbtiles');

function randomFile(mbs, callback) {
  const filepath = path.join(os.tmpdir(), crypto.randomBytes(8).toString('hex'));
  const tmpfile = fs.createWriteStream(filepath);
  const data = crypto.pseudoRandomBytes(1024 * 1024);
  let i;

  tmpfile.on('finish', () => {
    callback(null, filepath);
  });

  for (i = 0; i < mbs; i++) tmpfile.write(data);
  tmpfile.end();
}

test('[parts] mbtiles file is split by tiles', (assert) => {
  const fixture = path.join(os.tmpdir(), crypto.randomBytes(8).toString('hex'));
  makeMbtiles(fixture, 100001, (err) => {
    assert.ifError(err, 'no error');
    if (err) return assert.end();
    const info = fs.statSync(fixture);
    info.filetype = 'mbtiles';
    splitToParts(fixture, info, (err, parts) => {
      assert.ifError(err, 'no error');
      assert.equal(parts, 2, 'expected number of parts');
      fs.unlink(fixture);
      assert.end();
    });
  });
});

test('[parts] serialtiles file is split by tiles', (assert) => {
  const fixture = path.resolve(__dirname, 'fixtures', '423567-lines.gz');
  const info = fs.statSync(fixture);
  info.filetype = 'serialtiles';
  splitToParts(fixture, info, (err, parts) => {
    assert.ifError(err, 'no error');
    assert.equal(parts, 3, 'three parts');
    assert.end();
  });
});

test('[parts] default path is to split by size', (assert) => {
  const mbs = 22;
  const expected = Math.ceil(mbs / 10);

  randomFile(mbs, (err, filepath) => {
    if (err) throw err;
    const info = fs.statSync(filepath);
    info.filetype = 'geojson';

    splitToParts(filepath, info, (err, parts) => {
      assert.ifError(err, 'no error');
      assert.equal(parts, expected, 'expected number of parts');
      fs.unlink(filepath);
      assert.end();
    });
  });
});
