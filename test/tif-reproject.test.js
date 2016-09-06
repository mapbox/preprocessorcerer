var test = require('tape');
var reproject = require('../preprocessors/tif-reproject.preprocessor');
var os = require('os');
var fs = require('fs');
var path = require('path');
var crypto = require('crypto');
var googleMerc = path.resolve(__dirname, 'fixtures', 'google-merc.tif');
var sphericalMerc = path.resolve(__dirname, 'fixtures', 'spherical-merc.tif');
var esriMerc = path.resolve(__dirname, 'fixtures', 'web-merc-aux-sphere.tif');
var wgs84 = path.resolve(__dirname, 'fixtures', 'wgs84.tif');
var geojson = path.resolve(__dirname, 'fixtures', 'valid.geojson');
var unsupported = path.resolve(__dirname, 'fixtures', 'unsupported-srs.tif');
var gdal = require('gdal');

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

test('[tif-reproject] reprojection: to epsg:3857', function(assert) {
  var outfile = path.join(os.tmpdir(), crypto.randomBytes(8).toString('hex'));
  reproject(wgs84, outfile, function(err) {
    assert.ifError(err, 'no error');
    var ds = gdal.open(outfile);
    assert.ok(ds.srs.isSame(gdal.SpatialReference.fromEPSG(3857)), 'reprojected correctly');
    ds.close();
    ds = null;
    fs.unlinkSync(outfile);
    assert.end();
  });
});

test('[tif-reproject] reprojection: failed due to unsupported srs', function(assert) {
  reproject(unsupported, { filetype: 'tif' }, function(err) {
    assert.ok(err, 'expected error');
    assert.equal(err.message, 'Unsupported SRS', 'expected error message');
    assert.end();
  });
});
