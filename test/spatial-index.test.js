var test = require('tape');
var path = require('path');
var os = require('os');
var fs = require('fs');
var crypto = require('crypto');
var index = require('../preprocessors/spatial-index.preprocessor');
var mkdirp = require('mkdirp');
var checksum = require('checksum');

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

test('[spatial-index] criteria: does not need an index', function(assert) {
  var fixture = path.resolve(__dirname, 'fixtures', 'valid.geojson');
  index.criteria(fixture, { filetype: 'geojson', size: index.index_worthy_size - 1 }, function(err, process) {
    assert.ifError(err, 'no error');
    assert.ok(!process, 'dont do process');
    assert.end();
  });
});

test('[spatial-index] criteria: does need an index', function(assert) {
  var fixture = path.resolve(__dirname, 'fixtures', 'valid.geojson');
  index.criteria(fixture, { filetype: 'geojson', size: index.index_worthy_size + 1 }, function(err, process) {
    assert.ifError(err, 'no error');
    assert.ok(process, 'do process');
    assert.end();
  });
});

test('[spatial-index] indexes (input folder output file)', function(assert) {
  var infile = path.resolve(__dirname, 'fixtures', 'valid.geojson');
  var original;
  checksum.file(infile, function(error, sum) {
    original = sum;
  });

  tmpdir(function(err, outdir) {
    index(infile, outdir, function(err) {
      checksum.file(path.join(outdir, 'valid.geojson'), function(error, sum) {
        assert.equal(original, sum);
        assert.ifError(err, 'no error');
        assert.ok(fs.existsSync(path.join(outdir, 'valid.geojson.index')));
        assert.end();
      });
    });
  });
});

test('[spatial-index] indexes (input folder output file)', function(assert) {
  var infile = path.resolve(__dirname, 'fixtures', 'index-validate-flag.geojson');
  var original;
  checksum.file(infile, function(error, sum) {
    original = sum;
  });

  tmpdir(function(err, outdir) {
    index(infile, outdir, function(err) {
      assert.ok(err, 'error properly handled');
      assert.equal(err, 'Invalid geojson feature', 'expected error message');
      checksum.file(path.join(outdir, 'index-validate-flag.geojson'), function(error, sum) {
        assert.equal(original, sum);
        assert.notOk(fs.existsSync(path.join(outdir, 'index-validate-flag.geojson.index')), 'index file should not exist due to feature error');
        assert.end();
      });
    });
  });
});