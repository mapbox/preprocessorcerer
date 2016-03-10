var test = require('tape');
var path = require('path');
var os = require('os');
var fs = require('fs');
var crypto = require('crypto');
var exec = require('child_process').exec;
var queue = require('queue-async');
var rimraf = require('rimraf');
var togeojson = require('../preprocessors/togeojson-gpx.preprocessor');

// Perform all preprocessorcery in a temporary directory. Otherwise output files
// with random names will litter the fixture directory
var fixtureDir = path.resolve(__dirname, 'fixtures', 'gpx');
var tmpdir = path.join(os.tmpdir(), crypto.randomBytes(8).toString('hex'));
var copy_cmd = 'cp -r';
if (process.platform === 'win32') {
  //during tests %PATH% env var is completely stripped. add Windows system dir back to get xcopy
  process.env.Path += ';' + path.join(process.env.windir, 'system32');
  copy_cmd = 'xcopy /s /y';
  tmpdir += '\\';
}

var cmd = [copy_cmd, fixtureDir, tmpdir].join(' ');
exec(cmd, function(err) {
  if (err) throw err;

  console.log(tmpdir);
  var q = queue();
  var fixtures = fs.readdirSync(tmpdir);
  fixtures.forEach(function(fixture) {
    q.defer(function(next) {
      test('[GPX ' + fixture + ']', function(assert) {
        var gpx = path.join(tmpdir, fixture);
        var outdirectory = path.join(tmpdir, crypto.randomBytes(8).toString('hex'));
        togeojson(gpx, outdirectory, function(err) {
          if (fixture.indexOf('ok') === 0) {
            assert.equal(err, undefined, ': GPX was processed');
            var converted = fs.readdirSync(outdirectory);
            assert.notEqual(converted.length, 0, ': verify output files were created');
          } else {
            assert.equal(typeof err, typeof new Error(), ': detected invalid GPX, ' + err);
          }

          assert.end();
          next();
        });
      });
    });
  });

  //clean up tmp directory
  q.awaitAll(function(err) {
    if (err) throw err;
    rimraf.sync(tmpdir);
  });
});

