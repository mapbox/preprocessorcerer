var test = require('tape');
var path = require('path');
var stacker = require('../preprocessors/geojson-stacker.preprocessor');
var os = require('os');
var fs = require('fs');
var crypto = require('crypto');

test('[geojson-stacker] criteria: not geojson', function(assert) {
  var fixture = path.join(__dirname, 'fixtures', 'valid.grids.mbtiles');
  stacker.criteria(fixture, { filetype: 'mbtiles' }, function(err, process) {
    assert.ifError(err, 'no error');
    assert.notOk(process, 'do not process');
    assert.end();
  });
});

test('[geojson-stacker] criteria: is geojson', function(assert) {
  var fixture = path.join(__dirname, 'fixtures', 'multiworld-line.geojson');
  stacker.criteria(fixture, { filetype: 'geojson' }, function(err, process) {
    assert.ifError(err, 'no error');
    assert.ok(process, 'do process');
    assert.end();
  });
});

test('[geojson-stacker] criteria: is not valid geojson', function(assert) {
  var fixture = path.join(__dirname, 'fixtures', 'invalid.geojson');
  stacker.criteria(fixture, { filetype: 'geojson' }, function(err, process) {
    assert.ifError(err, 'no error');
    assert.notOk(process, 'do not process');
    assert.end();
  });
});

test('[geojson-stacker] stacks', function(assert) {
  var infile = path.join(__dirname, 'fixtures', 'multiworld-line.geojson');
  var outfile = path.join(os.tmpdir(), crypto.randomBytes(8).toString('hex'));
  var expected = fs.readFileSync(path.join(__dirname, 'fixtures', 'multiworld-line-stacked.geojson'), 'utf8');

  stacker(infile, outfile, function(err) {
    assert.ifError(err, 'no error');
    var outData = fs.readFileSync(outfile, 'utf8');

    assert.doesNotThrow(function() {
      JSON.parse(outData);
    }, 'outfile is JSON.parse-able');

    assert.equal(outData.trim(), expected.trim(), 'outfile has expected data');

    fs.unlink(outfile, function(err) {
      assert.end(err);
    });
  });
});
