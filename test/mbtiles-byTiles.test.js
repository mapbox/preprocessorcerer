'use strict';
const test = require('tape');
const mbtilesByTiles = require('../parts/mbtiles-byTiles');
const path = require('path');
const makeMbtiles = require('./fixtures/mbtiles-count/make-mbtiles');
const os = require('os');
const fs = require('fs');
const crypto = require('crypto');

test('[parts mbtiles] correct number of parts for mbtiles without grids table', (assert) => {
  const fixture = path.join(os.tmpdir(), crypto.randomBytes(8).toString('hex'));
  makeMbtiles(fixture, 305000, (err) => {
    if (err) throw err;

    mbtilesByTiles(fixture, { filetype: 'mbtiles' }, (err, parts) => {
      assert.ifError(err, 'no error');
      assert.equal(parts, 4, 'four parts');
      fs.unlinkSync(fixture);
      assert.end();
    });
  });
});

test('[parts mbtiles] correct number of parts for mbtiles without tiles table', (assert) => {
  const fixture = path.resolve(__dirname, 'fixtures', 'valid.grids.mbtiles');
  const info = fs.statSync(fixture);
  info.filetype = 'mbtiles';
  mbtilesByTiles(fixture, info, (err, parts) => {
    assert.ifError(err, 'no error');
    assert.equal(parts, 1, 'one part');
    assert.end();
  });
});

test('[parts mbtiles] correct number of parts for mbtiles with both tables', (assert) => {
  const fixture = path.resolve(__dirname, 'fixtures', 'valid-tilesgrid.mbtiles');
  const info = fs.statSync(fixture);
  info.filetype = 'mbtiles';
  mbtilesByTiles(fixture, info, (err, parts) => {
    assert.ifError(err, 'no error');
    assert.equal(parts, 1, 'one part');
    assert.end();
  });
});
