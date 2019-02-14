'use strict';
const test = require('tape');
const toBytes = require('../preprocessors/tif-toBytes.preprocessor');
const os = require('os');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const geojson = path.resolve(__dirname, 'fixtures', 'valid.geojson');
const malformed = path.resolve(__dirname, 'fixtures', 'malformed.tif');
const wgs84 = path.resolve(__dirname, 'fixtures', 'wgs84.tif');
const uint16 = path.resolve(__dirname, 'fixtures', 'wgs84.16.tif');
const gdal = require('gdal');

test('[tif-toBytes] criteria: not a tif', (assert) => {
  toBytes.criteria(geojson, { filetype: 'geojson' }, (err, process) => {
    assert.ifError(err, 'no error');
    assert.notOk(process, 'do not process');
    assert.end();
  });
});

test('[tif-toBytes] criteria: malformed tif', (assert) => {
  toBytes.criteria(malformed, { filetype: 'tif' }, (err) => {
    assert.ok(err, 'expected error');
    assert.end();
  });
});

test('[tif-toBytes] criteria: not a Uint16 tif', (assert) => {
  toBytes.criteria(wgs84, { filetype: 'tif' }, (err, process) => {
    assert.ifError(err, 'no error');
    assert.notOk(process, 'do not process');
    assert.end();
  });
});

test('[tif-toBytes] criteria: is a Uint16 tif', (assert) => {
  toBytes.criteria(uint16, { filetype: 'tif' }, (err, process) => {
    assert.ifError(err, 'no error');
    assert.ok(process, 'do process');
    assert.end();
  });
});

test('[tif-toBytes] convert to bytes', (assert) => {
  const outfile = path.join(os.tmpdir(), crypto.randomBytes(8).toString('hex'));
  toBytes(uint16, outfile, (err) => {
    assert.ifError(err, 'no error');
    let ds = gdal.open(outfile);
    ds.bands.forEach((band) => {
      assert.equal(band.dataType, gdal.GDT_Byte, 'converted band ' + band.id + ' to bytes');
    });

    ds.close();
    ds = null;
    fs.unlink(outfile, (err) => {
      assert.end(err);
    });
  });
});
