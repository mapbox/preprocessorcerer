var test = require('tape');
var path = require('path');
var os = require('os');
var fs = require('fs');
var crypto = require('crypto');
var mkdirp = require('mkdirp');
var exec = require('child_process').exec;
var togeojson = require('../preprocessors/togeojson-gpx.preprocessor');

// Perform all preprocessorcery in a temporary directory. Otherwise output files
// with random names will litter the fixture directory
function tmpdir(callback) {
  var dir = path.join(os.tmpdir(), crypto.randomBytes(8).toString('hex'));
  var fixtureDir = path.resolve(__dirname, 'fixtures', 'gpx');
  var copy_cmd = 'cp -r';

  if (process.platform === 'win32') {
    //during tests %PATH% env var is completely stripped. add Windows system dir back to get xcopy
    process.env.Path += ';' + path.join(process.env.windir, 'system32');
    copy_cmd = 'xcopy /s /y';
    dir += '\\';
    var cmd = [copy_cmd, fixtureDir, dir].join(' ');
    exec(cmd, function(err) {
      if (err) return callback(err);
      callback(null, dir);
    });
  } else {
    mkdirp(dir, function(err) {
      if (err) return callback(err);
      callback(null, dir);
    });
  }
}

test('[GPX togeojson] fails duplicate layer names', function(assert) {
  var infile = path.resolve(__dirname, 'fixtures', 'gpx', 'fail-no-features.gpx');

  tmpdir(function(err, outdir) {
    togeojson(infile, outdir, function(err) {
      assert.ok(err, 'error properly handled');
      assert.equal(err.message, 'GPX does not contain any valid features.', 'expected error message');
      assert.end();
    });
  });
});

test('[GPX togeojson] fails empty features only', function(assert) {
  var infile = path.resolve(__dirname, 'fixtures', 'gpx', 'fail-corrupted-file.gpx');

  tmpdir(function(err, outdir) {
    togeojson(infile, outdir, function(err) {
      assert.ok(err, 'error properly handled');
      assert.equal(err.message, 'Error: Error opening dataset', 'expected error message');
      assert.end();
    });
  });
});

test('[GPX togeojson] convert and index valid GPX', function(assert) {
  var infile = path.resolve(__dirname, 'fixtures', 'gpx', 'ok-valid-file.gpx');

  tmpdir(function(err, outdir) {
    togeojson(infile, outdir, function(err) {
      if (err) throw err;
      assert.ifError(err, 'no error');
      assert.ok(fs.existsSync(path.join(outdir, 'tracks.geojson')), 'converted layer');
      assert.ok(fs.existsSync(path.join(outdir, 'metadata.json')), 'added metadata of original gpx');
      assert.end();
    });
  });
});

