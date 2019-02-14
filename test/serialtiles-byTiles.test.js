'use strict';
const test = require('tape');
const path = require('path');
const fs = require('fs');
const serialtilesByTiles = require('../parts/serialtiles-byTiles');

test('[parts serialtiles] correct number of parts', (assert) => {
  const fixture = path.resolve(__dirname, 'fixtures', '423567-lines.gz');
  const info = fs.statSync(fixture);
  info.filetype = 'serialtiles';
  serialtilesByTiles(fixture, info, (err, parts) => {
    assert.ifError(err, 'no error');
    assert.equal(parts, 3, 'three parts');
    assert.end();
  });
});
