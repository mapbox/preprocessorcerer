var test = require('tape');
var overviews = require('../preprocessors/tif-overviews.preprocessor.disabled');
var path = require('path');
var os = require('os');
var crypto = require('crypto');
var gdal = require('gdal');

test('[tif-overviews] criteria: not a tiff', function(assert) {
  var fixture = path.resolve(__dirname, 'fixtures', 'not-tiff.jpg');
  overviews.criteria(fixture, { filetype: 'jpg' }, function(err, process) {
    assert.ifError(err, 'no error');
    assert.notOk(process, 'do not process');
    assert.end();
  });
});

test('[tif-overviews] criteria: invalid gdal file', function(assert) {
  var fixture = path.resolve(__dirname, 'fixtures', 'invalid.txt');
  overviews.criteria(fixture, { filetype: 'tif' }, function(err, process) {
    assert.ok(err, 'expected error');
    assert.notOk(process, 'do not process');
    assert.end();
  });
});

test('[tif-overviews] build overviews', function(assert) {
  var fixture = path.resolve(__dirname, 'fixtures', 'no-overviews.tif');
  var outfile = path.join(os.tmpdir(), crypto.randomBytes(8).toString('hex'));

  overviews(fixture, outfile, function(err) {
    assert.ifError(err, 'no error');

    var ds = gdal.open(outfile);
    ds.bands.forEach(function(band) {
      assert.ok(band.overviews.count() > 0, 'band ' + band.id + ' has overviews');
    });

    assert.end();
  });
});
