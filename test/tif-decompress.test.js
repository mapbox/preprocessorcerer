var test = require('tape');
var decompress = require('../preprocessors/tif-decompress.preprocessor');
var path = require('path');
var crypto = require('crypto');
var geojson = path.resolve(__dirname, 'fixtures', 'valid.geojson');
var uncompressed = path.resolve(__dirname, 'fixtures', 'uncompressed.tif');
var compressed = path.resolve(__dirname, 'fixtures', 'compressed.tif');
var gdal = require('gdal');

test('[tif-decompress] criteria: not a tif', function(assert) {
  decompress.criteria(geojson, { filetype: 'geojson' }, function(err, process) {
    assert.ifError(err, 'no error');
    assert.notOk(process, 'do not process');
    assert.end();
  });
});

test('[tif-decompress] criteria: not compressed', function(assert) {
  decompress.criteria(uncompressed, { filetype: 'tif' }, function(err, process) {
    assert.ifError(err, 'no error');
    assert.notOk(process, 'do not process');
    assert.end();
  });
});

test('[tif-decompress] decompress: verify exact copy', function(assert) {
  var outfile = path.join(__dirname, crypto.randomBytes(8).toString('hex'));

  decompress(compressed, outfile, function(err) {
    assert.ifError(err, 'no error');
    var ds = gdal.open(compressed);
    var checksum = 0;
    ds.bands.forEach(function(band) {
      checksum = checksum + gdal.checksumImage(band);
    });

    var dscopy = gdal.open(outfile + '.tif');
    var checksum_copy = 0;
    dscopy.bands.forEach(function(band) {
      checksum_copy = checksum_copy + gdal.checksumImage(band);
    });

    assert.equal(checksum_copy, checksum, 'outfile and infile should have same checksum');
    assert.end();
  });
});
