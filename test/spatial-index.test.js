'use strict';
const test = require('tape');
const path = require('path');
const os = require('os');
const fs = require('fs');
const crypto = require('crypto');
const index = require('../preprocessors/spatial-index.preprocessor');
const mkdirp = require('mkdirp');
const checksum = require('checksum');
const rimraf = require('rimraf');

function tmpdir(callback) {
  const dir = path.join(os.tmpdir(), crypto.randomBytes(8).toString('hex'));

  mkdirp(dir, (err) => {
    if (err) return callback(err);
    callback(null, dir);
  });
}

test('[spatial-index] criteria: not an indexable file', (assert) => {
  const fixture = path.resolve(__dirname, 'fixtures', 'bom.geojson');
  index.criteria(fixture, { filetype: 'txt' }, (err, process) => {
    assert.ifError(err, 'no error');
    assert.notOk(process, 'do not process');
    assert.end();
  });
});

test('[spatial-index] exposes index_worthy_size', (assert) => {
  assert.equal(index.index_worthy_size, 10 * 1024 * 1024); // 10MB
  assert.end();
});

test('[spatial-index] criteria: does not need an index', (assert) => {
  const fixture = path.resolve(__dirname, 'fixtures', 'valid.geojson');
  index.criteria(fixture, { filetype: 'geojson', size: index.index_worthy_size - 1 }, (err, process) => {
    assert.ifError(err, 'no error');
    assert.ok(!process, 'dont do process');
    assert.end();
  });
});

test('[spatial-index] criteria: does need an index', (assert) => {
  const fixture = path.resolve(__dirname, 'fixtures', 'valid.geojson');
  index.criteria(fixture, { filetype: 'geojson', size: index.index_worthy_size + 1 }, (err, process) => {
    assert.ifError(err, 'no error');
    assert.ok(process, 'do process');
    assert.end();
  });
});

test('[spatial-index] indexes (input folder output file)', (assert) => {
  const infile = path.resolve(__dirname, 'fixtures', 'valid.geojson');
  let original;
  checksum.file(infile, (error, sum) => {
    original = sum;
  });

  tmpdir((err, outdir) => {
    index(infile, outdir, (err) => {
      checksum.file(path.join(outdir, 'valid.geojson'), (error, sum) => {
        assert.equal(original, sum);
        assert.ifError(err, 'no error');
        assert.ok(fs.existsSync(path.join(outdir, 'valid.geojson.index')));
        rimraf(outdir, (err) => {
          if (err) throw err;
          assert.end();
        });
      });
    });
  });
});

test('[spatial-index] handles error in case of invalid feature', (assert) => {
  const infile = path.resolve(__dirname, 'fixtures', 'index-validate-flag.geojson');
  let original;
  checksum.file(infile, (error, sum) => {
    original = sum;
  });

  tmpdir((err, outdir) => {
    index(infile, outdir, (err) => {
      assert.ok(err, 'error properly handled');
      assert.equal(err.message, 'Invalid CSV or GeoJSON.', 'expected error message');
      checksum.file(path.join(outdir, 'index-validate-flag.geojson'), (error, sum) => {
        assert.equal(original, sum);
        assert.notOk(fs.existsSync(path.join(outdir, 'index-validate-flag.geojson.index')), 'index file should not exist due to feature error');
        rimraf(outdir, (err) => {
          if (err) throw err;
          assert.end();
        });
      });
    });
  });
});
