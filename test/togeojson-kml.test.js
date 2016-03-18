var test = require('tape');
var path = require('path');
var os = require('os');
var fs = require('fs');
var crypto = require('crypto');
var exec = require('child_process').exec;
var queue = require('queue-async');
var rimraf = require('rimraf');
var togeojson = require('../preprocessors/togeojson-kml.preprocessor');
var checksum = require('checksum');

// Perform all preprocessorcery in a temporary directory. Otherwise output files
// with random names will litter the fixture directory
function tmpdir(callback) {
  var dir = path.join(os.tmpdir(), crypto.randomBytes(8).toString('hex'));
  var fixtureDir = path.resolve(__dirname, 'fixtures', 'kml');
  var copy_cmd = 'cp -r';
  
  if (process.platform === 'win32') {
    //during tests %PATH% env var is completely stripped. add Windows system dir back to get xcopy
    process.env.Path += ';' + path.join(process.env.windir, 'system32');
    copy_cmd = 'xcopy /s /y';
    dir += '\\';
  }

  var cmd = [copy_cmd, fixtureDir, dir].join(' ');
  exec(cmd, function(err) {
    if (err) return callback(err);
    callback(null, dir);
  });
}

test('[KML togeojson] fails duplicate layer names', function(assert) {
  var infile = path.resolve(__dirname, 'fixtures', 'kml','fail-duplicate-layer-names.kml');
  var original;
  checksum.file(infile, function(error, sum) {
    original = sum;
  });

  tmpdir(function(err, outdir) {
    togeojson(infile, outdir, function(err) {
      assert.ok(err, 'error properly handled');
      assert.equal(err.message, 'Duplicate layer names! \'duplicate layer name\' found 2 times, \'layer 2\' found 2 times', 'expected error message');
      checksum.file(path.join(outdir, 'fail-duplicate-layer-names.kml'), function(error, sum) {
        assert.equal(original, sum);
        assert.end();
      });
    });
  });
});

test('[KML togeojson] fails empty features only', function(assert) {
  var infile = path.resolve(__dirname, 'fixtures', 'kml','fail-empty-features-only.kml');
  var original;
  checksum.file(infile, function(error, sum) {
    original = sum;
  });

  tmpdir(function(err, outdir) {
    togeojson(infile, outdir, function(err) {
      assert.ok(err, 'error properly handled');
      assert.equal(err.message, 'KML does not contain any valid features', 'expected error message');
      checksum.file(path.join(outdir, 'fail-empty-features-only.kml'), function(error, sum) {
        assert.equal(original, sum);
        assert.end();
      });
    });
  });
});

test('[KML togeojson] fails empty features only', function(assert) {
  var infile = path.resolve(__dirname, 'fixtures', 'kml','fail-invalid.kml');
  var original;
  checksum.file(infile, function(error, sum) {
    original = sum;
  });

  tmpdir(function(err, outdir) {
    togeojson(infile, outdir, function(err) {
      assert.ok(err, 'error properly handled');
      assert.equal(err.message, 'Error opening dataset', 'expected error message');
      checksum.file(path.join(outdir, 'fail-invalid.kml'), function(error, sum) {
        assert.equal(original, sum);
        assert.end();
      });
    });
  });
});

test('[KML togeojson] fails empty features only', function(assert) {
  var infile = path.resolve(__dirname, 'fixtures', 'kml','fail-more-than-15-layers.kml');
  var original;
  checksum.file(infile, function(error, sum) {
    original = sum;
  });

  tmpdir(function(err, outdir) {
    togeojson(infile, outdir, function(err) {
      assert.ok(err, 'error properly handled');
      assert.equal(err.message, '22 layers found. Maximum of 15 layers allowed.', 'expected error message');
      checksum.file(path.join(outdir, 'fail-more-than-15-layers.kml'), function(error, sum) {
        assert.equal(original, sum);
        assert.end();
      });
    });
  });
});

test('[KML togeojson] convert and index valid kml', function(assert) {
  var infile = path.resolve(__dirname, 'fixtures', 'kml','ok-layers-folders-emptygeometries.kml');
  var original;
  checksum.file(infile, function(error, sum) {
    original = sum;
  });

  tmpdir(function(err, outdir) {
    togeojson(infile, outdir, function(err) {
      checksum.file(path.join(outdir, 'ok-layers-folders-emptygeometries.kml'), function(error, sum) {
        assert.ifError(err, 'no error');
        assert.equal(original, sum);
        assert.ok(fs.existsSync(path.join(outdir, 'folder-01-01.geojson.index')), 'indexed layer');
        assert.ok(fs.existsSync(path.join(outdir, 'folder-01.geojson.index')), 'indexed layer');
        assert.ok(fs.existsSync(path.join(outdir, 'folder-02.geojson.index')), 'indexed layer');
        assert.ok(fs.existsSync(path.join(outdir, 'my-test.geojson.index')), 'indexed layer');
        assert.ok(fs.existsSync(path.join(outdir, 'metadata.json')), 'added metadata of original kml');
        assert.end();
      });
    });
  });
});
// var cmd = [copy_cmd, fixtureDir, tmpdir].join(' ');
// console.log(cmd);
// exec(cmd, function(err) {
//   if (err) throw err;

//   console.log(tmpdir);
//   var q = queue();
//   var fixtures = fs.readdirSync(tmpdir);
//   fixtures.forEach(function(fixture) {
//     q.defer(function(next) {
//       test('[KML ' + fixture + ']', function(assert) {
//         var kml = path.join(tmpdir, fixture);
//         var outdirectory = path.join(tmpdir, crypto.randomBytes(8).toString('hex'));
//         togeojson(kml, outdirectory, function(err) {
//           if (fixture.indexOf('ok') === 0) {
//             var converted = fs.readdirSync(outdirectory);
//             console.log(converted);
//             assert.equal(err, undefined, ': KML was procssed');
//             assert.notEqual(converted.length, 0, ': verify output files were created');

//             //assert.ok(fs.existsSync(path.join(outdirectory, 'metadata.json')), ': contains metadata for original kml');
//           } else {
//             assert.equal(typeof err, typeof new Error(), ': detected invalid KML, ' + err);
//           }

//           assert.end();
//           next();
//         });
//       });
//     });
//   });

//   //clean up tmp directory
//   q.awaitAll(function(err) {
//     if (err) throw err;
//     rimraf.sync(tmpdir);
//   });
// });

