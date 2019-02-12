'use strict';
const test = require('tape');
const path = require('path');
const os = require('os');
const crypto = require('crypto');
const bom = require('../preprocessors/geojson-bom.preprocessor');
const fs = require('fs');

test('[geojson-bom] criteria: not geojson', (assert) => {
  const fixture = path.join(__dirname, 'fixtures', 'wgs84.tif');
  bom.criteria(fixture, { filetype: 'tif' }, (err, process) => {
    assert.ifError(err, 'no error');
    assert.notOk(process, 'do not process');
    assert.end();
  });
});

test('[geojson-bom] criteria: no bom', (assert) => {
  const fixture = path.join(__dirname, 'fixtures', 'valid.geojson');
  bom.criteria(fixture, { filetype: 'geojson' }, (err, process) => {
    assert.ifError(err, 'no error');
    assert.notOk(process, 'do not process');
    assert.end();
  });
});

test('[geojson-bom] criteria: haz bom', (assert) => {
  const fixture = path.join(__dirname, 'fixtures', 'bom.geojson');
  bom.criteria(fixture, { filetype: 'geojson' }, (err, process) => {
    assert.ifError(err, 'no error');
    assert.ok(process, 'do process');
    assert.end();
  });
});

test('[geojson-bom] removes bom', (assert) => {
  const infile = path.join(__dirname, 'fixtures', 'bom.geojson');
  const outfile = path.join(os.tmpdir(), crypto.randomBytes(8).toString('hex'));

  bom(infile, outfile, (err) => {
    assert.ifError(err, 'no error');
    const outData = fs.readFileSync(outfile, 'utf8');
    assert.doesNotThrow(() => {
      JSON.parse(outData);
    }, 'outfile is JSON.parse-able');

    fs.unlink(outfile, (err) => {
      assert.end(err);
    });
  });
});
