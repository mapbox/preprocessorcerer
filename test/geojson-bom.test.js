var test = require('tape');
var path = require('path');
var os = require('os');
var crypto = require('crypto');
var bom = require('../preprocessors/geojson-bom.preprocessor');
var fs = require('fs');

test('[geojson-bom] criteria: not geojson', function(assert) {
  var fixture = path.join(__dirname, 'fixtures', 'wgs84.tif');
  bom.criteria(fixture, { filetype: 'tif' }, function(err, process) {
    assert.ifError(err, 'no error');
    assert.notOk(process, 'do not process');
    assert.end();
  });
});

test('[geojson-bom] criteria: no bom', function(assert) {
  var fixture = path.join(__dirname, 'fixtures', 'valid.geojson');
  bom.criteria(fixture, { filetype: 'geojson' }, function(err, process) {
    assert.ifError(err, 'no error');
    assert.notOk(process, 'do not process');
    assert.end();
  });
});

test('[geojson-bom] criteria: haz bom', function(assert) {
  var fixture = path.join(__dirname, 'fixtures', 'bom.geojson');
  bom.criteria(fixture, { filetype: 'geojson' }, function(err, process) {
    assert.ifError(err, 'no error');
    assert.ok(process, 'do process');
    assert.end();
  });
});

test('[geojson-bom] removes bom', function(assert) {
  var infile = path.join(__dirname, 'fixtures', 'bom.geojson');
  var outfile = path.join(os.tmpdir(), crypto.randomBytes(8).toString('hex'));

  bom(infile, outfile, function(err) {
    assert.ifError(err, 'no error');
    var outData = fs.readFileSync(outfile, 'utf8');
    assert.doesNotThrow(function() {
      JSON.parse(outData);
    }, 'outfile is JSON.parse-able');

    assert.end();
  });
});
