'use strict';
const test = require('tape');
const path = require('path');
const os = require('os');
const fs = require('fs');
const crypto = require('crypto');
const mkdirp = require('mkdirp');
const rimraf = require('rimraf');
const exec = require('child_process').exec;
const togeojson = require('../preprocessors/togeojson-gpx.preprocessor');

// Perform all preprocessorcery in a temporary directory. Otherwise output files
// with random names will litter the fixture directory
function tmpdir(callback) {
  let dir = path.join(os.tmpdir(), crypto.randomBytes(8).toString('hex'));
  const fixtureDir = path.resolve(__dirname, 'fixtures', 'gpx');
  let copy_cmd = 'cp -r';

  if (process.platform === 'win32') {
    // during tests %PATH% env var is completely stripped. add Windows system dir back to get xcopy
    process.env.Path += ';' + path.join(process.env.windir, 'system32');
    copy_cmd = 'xcopy /s /y';
    dir += '\\';
    const cmd = [copy_cmd, fixtureDir, dir].join(' ');
    exec(cmd, (err) => {
      if (err) return callback(err);
      callback(null, dir);
    });
  } else {
    mkdirp(dir, (err) => {
      if (err) return callback(err);
      callback(null, dir);
    });
  }
}

test('[GPX togeojson] fails duplicate layer names', (assert) => {
  const infile = path.resolve(__dirname, 'fixtures', 'gpx', 'fail-no-features.gpx');

  tmpdir((err, outdir) => {
    togeojson(infile, outdir, (err) => {
      assert.ok(err, 'error properly handled');
      assert.equal(err.message, 'GPX does not contain any valid features.', 'expected error message');
      rimraf(outdir, (err) => {
        assert.end(err);
      });
    });
  });
});

test('[GPX togeojson] fails empty features only', (assert) => {
  const infile = path.resolve(__dirname, 'fixtures', 'gpx', 'fail-corrupted-file.gpx');

  tmpdir((err, outdir) => {
    togeojson(infile, outdir, (err) => {
      assert.ok(err, 'error properly handled');
      assert.equal(err.message, 'Error: Error opening dataset', 'expected error message');
      rimraf(outdir, (err) => {
        assert.end(err);
      });
    });
  });
});

test('[GPX togeojson] convert, index, and archive valid GPX', (assert) => {
  const infile = path.resolve(__dirname, 'fixtures', 'gpx', 'ok-valid-file.gpx');
  togeojson.index_worthy_size = 100; // 100 bytes

  tmpdir((err, outdir) => {
    togeojson(infile, outdir, (err) => {
      const originalfile = fs.readFileSync(infile);
      const archivedfile = fs.readFileSync(path.join(outdir, 'archived.gpx'));
      if (err) throw err;
      assert.ifError(err, 'no error');
      assert.ok(fs.existsSync(path.join(outdir, 'tracks.geojson')), 'converted layer');
      assert.ok(fs.existsSync(path.join(outdir, 'tracks.geojson.index')), 'created index');
      assert.ok(fs.existsSync(path.join(outdir, 'metadata.json')), 'added metadata of original gpx');
      assert.ok(fs.existsSync(path.join(outdir, 'archived.gpx')), 'original file archived');
      assert.equal(originalfile.compare(archivedfile), 0, 'file contents are the same');
      rimraf(outdir, (err) => {
        assert.end(err);
      });
    });
  });
});
