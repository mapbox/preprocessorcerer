var test = require('tape');
var path = require('path');
var os = require('os');
var fs = require('fs');
var crypto = require('crypto');
var exec = require('child_process').exec;
var queue = require('queue-async');
var rimraf = require('rimraf');
var togeojson = require('../preprocessors/togeojson-kml.preprocessor');

// Perform all preprocessorcery in a temporary directory. Otherwise output files
// with random names will litter the fixture directory
var fixtureDir = path.resolve(__dirname, 'fixtures', 'kml');
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
      test('[KML ' + fixture + ']', function(assert) {
        var kml = path.join(tmpdir, fixture);
        var outdirectory = path.join(tmpdir, crypto.randomBytes(8).toString('hex'));
        togeojson(kml, outdirectory, function(err) {
          if (fixture.indexOf('ok') === 0) {
            var converted = fs.readdirSync(outdirectory);
            console.log(converted);
            assert.equal(err, undefined, ': KML was procssed');
            assert.notEqual(converted.length, 0, ': verify output files were created');
            //assert.ok(fs.existsSync(path.join(outdirectory, 'metadata.json')), ': contains metadata for original kml');
          } else {
            assert.equal(typeof err, typeof new Error(), ': detected invalid KML, ' + err);
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

