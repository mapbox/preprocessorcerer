var test = require('tape');
var toBytes = require('../preprocessors/tif-toBytes.preprocessor');
var os = require('os');
var fs = require('fs');
var path = require('path');
var crypto = require('crypto');
var geojson = path.resolve(__dirname, 'fixtures', 'valid.geojson');
var malformed = path.resolve(__dirname, 'fixtures', 'malformed.tif');
var wgs84 = path.resolve(__dirname, 'fixtures', 'wgs84.tif');
var uint16 = path.resolve(__dirname, 'fixtures', 'wgs84.16.tif');
var gdal = require('gdal');

test('[tif-toBytes] criteria: not a tif', function(assert) {
  toBytes.criteria(geojson, { filetype: 'geojson' }, function(err, process) {
    assert.ifError(err, 'no error');
    assert.notOk(process, 'do not process');
    assert.end();
  });
});

test('[tif-toBytes] criteria: malformed tif', function(assert) {
  toBytes.criteria(malformed, { filetype: 'tif' }, function(err) {
    assert.ok(err, 'expected error');
    assert.end();
  });
});

test('[tif-toBytes] criteria: not a Uint16 tif', function(assert) {
  toBytes.criteria(wgs84, { filetype: 'tif' }, function(err, process) {
    assert.ifError(err, 'no error');
    assert.notOk(process, 'do not process');
    assert.end();
  });
});

test('[tif-toBytes] criteria: is a Uint16 tif', function(assert) {
  toBytes.criteria(uint16, { filetype: 'tif' }, function(err, process) {
    assert.ifError(err, 'no error');
    assert.ok(process, 'do process');
    assert.end();
  });
});

test('[tif-toBytes] convert to bytes', function(assert) {
  var outfile = path.join(os.tmpdir(), crypto.randomBytes(8).toString('hex'));
  toBytes(uint16, outfile, function(err) {
    assert.ifError(err, 'no error');
    var ds = gdal.open(outfile);
    ds.bands.forEach(function(band) {
      assert.equal(band.dataType, gdal.GDT_Byte, 'converted band ' + band.id + ' to bytes');
    });

    ds.close();
    ds = null;
    fs.unlink(outfile, function(err) {
      assert.end(err);
    });
  });
});
