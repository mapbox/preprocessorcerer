'use strict';
const test = require('tape');
const reproject = require('../preprocessors/tif-reproject.preprocessor');
const os = require('os');
const path = require('path');
const crypto = require('crypto');
const googleMerc = path.resolve(__dirname, 'fixtures', 'google-merc.tif');
const sphericalMerc = path.resolve(__dirname, 'fixtures', 'spherical-merc.tif');
const esriMerc = path.resolve(__dirname, 'fixtures', 'web-merc-aux-sphere.tif');
const wgs84 = path.resolve(__dirname, 'fixtures', 'wgs84.tif');
const geojson = path.resolve(__dirname, 'fixtures', 'valid.geojson');
const invalidReprojection = path.resolve(__dirname, 'fixtures', 'invalid-reprojection.tif');

test('[tif-reproject] criteria: not a tif', (assert) => {
  reproject.criteria(geojson, { filetype: 'geojson' }, (err, process) => {
    assert.ifError(err, 'no error');
    assert.notOk(process, 'do not process');
    assert.end();
  });
});

test('[tif-reproject] criteria: in epsg:3857', (assert) => {
  reproject.criteria(sphericalMerc, { filetype: 'tif' }, (err, process) => {
    assert.ifError(err, 'no error');
    assert.notOk(process, 'do not process');
    assert.end();
  });
});

test('[tif-reproject] criteria: in epsg:900913', (assert) => {
  reproject.criteria(googleMerc, { filetype: 'tif' }, (err, process) => {
    assert.ifError(err, 'no error');
    assert.notOk(process, 'do not process');
    assert.end();
  });
});

test('[tif-reproject] criteria: in web mercator (auxiliary sphere)', (assert) => {
  reproject.criteria(esriMerc, { filetype: 'tif' }, (err, process) => {
    assert.ifError(err, 'no error');
    assert.notOk(process, 'do not process');
    assert.end();
  });
});

test('[tif-reproject] criteria: in epsg:4326', (assert) => {
  reproject.criteria(wgs84, { filetype: 'tif' }, (err, process) => {
    assert.ifError(err, 'no error');
    assert.ok(process, 'do process');
    assert.end();
  });
});

test('[tif-reproject] invalid reprojection: to epsg:3857', (assert) => {
  const outfile = path.join(os.tmpdir(), crypto.randomBytes(8).toString('hex'));
  reproject(invalidReprojection, outfile, (err) => {
    assert.equal(err.code, 'EINVALID');
    assert.equal(err.message, 'Unable to reproject data. Please reproject to Web Mercator (EPSG:3857) and try again.');
    assert.end();
  });
});
