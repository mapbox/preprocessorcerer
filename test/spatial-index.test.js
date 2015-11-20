var test = require('tape');
var path = require('path');
var os = require('os');
var fs = require('fs');
var crypto = require('crypto');
var index = require('../preprocessors/spatial-index.preprocessor');
var mkdirp = require('mkdirp');

function tmpdir(callback) {
  var dir = path.join(os.tmpdir(), crypto.randomBytes(8).toString('hex'));

  mkdirp(dir, function(err) {
    if (err) return callback(err);
    callback(null, dir);
  });
}

test('[spatial-index] criteria: not an indexable file', function(assert) {
  var fixture = path.resolve(__dirname, 'fixtures', 'bom.geojson');
  index.criteria(fixture, { filetype: 'txt' }, function(err, process) {
    assert.ifError(err, 'no error');
    assert.notOk(process, 'do not process');
    assert.end();
  });
});

test('[spatial-index] exposes index_worthy_size', function(assert) {
  assert.equal(index.index_worthy_size, 10485760);
  assert.end();
});

test('[spatial-index] criteria: does not have an index', function(assert) {
  var fixture = path.resolve(__dirname, 'fixtures', 'valid.geojson');
  index.criteria(fixture, { filetype: 'geojson', size: index.index_worthy_size - 1 }, function(err, process) {
    assert.ifError(err, 'no error');
    assert.ok(!process, 'do process');
    assert.end();
  });
});

test('[spatial-index] criteria: does have an index', function(assert) {
  var fixture = path.resolve(__dirname, 'fixtures', 'valid.geojson');
  index.criteria(fixture, { filetype: 'geojson', size: index.index_worthy_size + 1 }, function(err, process) {
    assert.ifError(err, 'no error');
    assert.ok(process, 'do process');
    assert.end();
  });
});

test('[spatial-index] indexes (input folder output file)', function(assert) {
  var infile = path.resolve(__dirname, 'fixtures', 'valid.geojson');
  tmpdir(function(err, outdir) {
    index(infile, outdir, function(err) {
      assert.ifError(err, 'no error');
      assert.ok(fs.existsSync(path.join(outdir, 'valid.geojson.index')));
      assert.end();
    });
  });
});
