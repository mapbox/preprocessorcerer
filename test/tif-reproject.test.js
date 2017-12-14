var test = require('tape');
var reproject = require('../preprocessors/tif-reproject.preprocessor');
var os = require('os');
var path = require('path');
var crypto = require('crypto');
var googleMerc = path.resolve(__dirname, 'fixtures', 'google-merc.tif');
var sphericalMerc = path.resolve(__dirname, 'fixtures', 'spherical-merc.tif');
var esriMerc = path.resolve(__dirname, 'fixtures', 'web-merc-aux-sphere.tif');
var wgs84 = path.resolve(__dirname, 'fixtures', 'wgs84.tif');
var geojson = path.resolve(__dirname, 'fixtures', 'valid.geojson');
var invalidReprojection = path.resolve(__dirname, 'fixtures', 'invalid-reprojection.tif');

test('[tif-reproject] criteria: not a tif', function(assert) {
  reproject.criteria(geojson, { filetype: 'geojson' }, function(err, process) {
    assert.ifError(err, 'no error');
    assert.notOk(process, 'do not process');
    assert.end();
  });
});

test('[tif-reproject] criteria: in epsg:3857', function(assert) {
  reproject.criteria(sphericalMerc, { filetype: 'tif' }, function(err, process) {
    assert.ifError(err, 'no error');
    assert.notOk(process, 'do not process');
    assert.end();
  });
});

test('[tif-reproject] criteria: in epsg:900913', function(assert) {
  reproject.criteria(googleMerc, { filetype: 'tif' }, function(err, process) {
    assert.ifError(err, 'no error');
    assert.notOk(process, 'do not process');
    assert.end();
  });
});

test('[tif-reproject] criteria: in web mercator (auxiliary sphere)', function(assert) {
  reproject.criteria(esriMerc, { filetype: 'tif' }, function(err, process) {
    assert.ifError(err, 'no error');
    assert.notOk(process, 'do not process');
    assert.end();
  });
});

test('[tif-reproject] criteria: in epsg:4326', function(assert) {
  reproject.criteria(wgs84, { filetype: 'tif' }, function(err, process) {
    assert.ifError(err, 'no error');
    assert.ok(process, 'do process');
    assert.end();
  });
});

test('[tif-reproject] invalid reprojection: to epsg:3857', function(assert) {
  var outfile = path.join(os.tmpdir(), crypto.randomBytes(8).toString('hex'));
  reproject(invalidReprojection, outfile, function(err) {
    assert.equal(err.code, 'EINVALID');
    assert.equal(err.message, 'Unable to reproject data. Please reproject to Web Mercator (EPSG:3857) and try again.');
    assert.end();
  });
});
