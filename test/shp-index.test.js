'use strict';
const test = require('tape');
const path = require('path');
const os = require('os');
const fs = require('fs');
const crypto = require('crypto');
const index = require('../preprocessors/shp-index.preprocessor');
const mkdirp = require('mkdirp');
const rimraf = require('rimraf');

function tmpfile(callback) {
  const dir = path.join(os.tmpdir(), crypto.randomBytes(8).toString('hex'));

  mkdirp(dir, (err) => {
    if (err) return callback(err);
    callback(null, path.join(dir, 'sm.shp'));
  });
}

test('[shp-index] criteria: not a shapefile', (assert) => {
  const fixture = path.resolve(__dirname, 'fixtures', 'invalid.txt');
  index.criteria(fixture, { filetype: 'txt' }, (err, process) => {
    assert.ifError(err, 'no error');
    assert.notOk(process, 'do not process');
    assert.end();
  });
});

test('[shp-index] criteria: has an index', (assert) => {
  const fixture = path.resolve(__dirname, 'fixtures', 'sm.indexed.shapefile');
  index.criteria(fixture, { filetype: 'shp' }, (err, process) => {
    assert.ifError(err, 'no error');
    assert.ok(process, 'do process');
    assert.end();
  });
});

test('[shp-index] indexes (input folder output file)', (assert) => {
  const infolder = path.resolve(__dirname, 'fixtures', 'sm.shapefile');
  tmpfile((err, outfile) => {
    index(infolder, outfile, (err) => {
      assert.ifError(err, 'no error');
      const files = fs.readdirSync(path.dirname(outfile))
        .filter((filename) => {
          return path.extname(filename) === '.index';
        });

      fs.stat(outfile, (err, stats) => {
        assert.equal(files.length, 1, 'created index file');
        assert.equal(stats.size, 428328, 'index created using index-parts');
        rimraf(path.dirname(outfile), (err) => {
          assert.end(err);
        });
      });
    });
  });
});

test('[shp-index] indexes (input folder output folder)', (assert) => {
  const infolder = path.resolve(__dirname, 'fixtures', 'sm.shapefile');
  tmpfile((err, outfile) => {
    index(infolder, path.dirname(outfile), (err) => {
      assert.ifError(err, 'no error');
      const files = fs.readdirSync(path.dirname(outfile))
        .filter((filename) => {
          return path.extname(filename) === '.index';
        });

      fs.stat(outfile, (err, stats) => {
        assert.equal(files.length, 1, 'created index file');
        assert.equal(stats.size, 428328, 'index created using index-parts');
        rimraf(path.dirname(outfile), (err) => {
          assert.end(err);
        });
      });
    });
  });
});

test('[shp-index] indexes (input file output file)', (assert) => {
  const infile = path.resolve(__dirname, 'fixtures', 'sm.shapefile', 'sm.shp');
  tmpfile((err, outfile) => {
    index(infile, outfile, (err) => {
      assert.ifError(err, 'no error');
      const files = fs.readdirSync(path.dirname(outfile))
        .filter((filename) => {
          return path.extname(filename) === '.index';
        });

      fs.stat(outfile, (err, stats) => {
        assert.equal(files.length, 1, 'created index file');
        assert.equal(stats.size, 428328, 'index created using index-parts');
        rimraf(path.dirname(outfile), (err) => {
          assert.end(err);
        });
      });
    });
  });
});

test('[shp-index] indexes (input file output folder)', (assert) => {
  const infile = path.resolve(__dirname, 'fixtures', 'sm.shapefile', 'sm.shp');
  tmpfile((err, outfile) => {
    index(infile, path.dirname(outfile), (err) => {
      assert.ifError(err, 'no error');
      const files = fs.readdirSync(path.dirname(outfile))
        .filter((filename) => {
          return path.extname(filename) === '.index';
        });

      fs.stat(outfile, (err, stats) => {
        assert.equal(files.length, 1, 'created index file');
        assert.equal(stats.size, 428328, 'index created using index-parts');
        rimraf(path.dirname(outfile), (err) => {
          assert.end(err);
        });
      });
    });
  });
});

test('[shp-index] does not index (input folder output file - no index)', (assert) => {
  const infolder = path.resolve(__dirname, 'fixtures', 'nullshapes.shapefile');
  tmpfile((err, outfile) => {
    index(infolder, outfile, (err) => {
      assert.ifError(err, 'no error');
      const files = fs.readdirSync(path.dirname(outfile))
        .filter((filename) => {
          return path.extname(filename) === '.index';
        });

      assert.equal(files.length, 0, 'did not create index file');
      rimraf(path.dirname(outfile), (err) => {
        assert.end(err);
      });
    });
  });
});

test('[shp-index] does not index (input file output file - no index)', (assert) => {
  const infile = path.resolve(__dirname, 'fixtures', 'nullshapes.shapefile', 'regional.shp');
  tmpfile((err, outfile) => {
    index(infile, outfile, (err) => {
      assert.ifError(err, 'no error');
      const files = fs.readdirSync(path.dirname(outfile))
        .filter((filename) => {
          return path.extname(filename) === '.index';
        });

      assert.equal(files.length, 0, 'did not create index file');
      rimraf(path.dirname(outfile), (err) => {
        assert.end(err);
      });
    });
  });
});

test('[shp-index] does not index (input file output folder - no index)', (assert) => {
  const infile = path.resolve(__dirname, 'fixtures', 'nullshapes.shapefile', 'regional.shp');
  tmpfile((err, outfile) => {
    index(infile, path.dirname(outfile), (err) => {
      assert.ifError(err, 'no error');
      const files = fs.readdirSync(path.dirname(outfile))
        .filter((filename) => {
          return path.extname(filename) === '.index';
        });

      assert.equal(files.length, 0, 'did not create index file');
      rimraf(path.dirname(outfile), (err) => {
        assert.end(err);
      });
    });
  });
});

test('[shp-index] does not contain pre-existing index (input file output folder - no index)', (assert) => {
  const infile = path.resolve(__dirname, 'fixtures', 'hasindex.shapefile', 'regional.shp');
  tmpfile((err, outfile) => {
    index(infile, path.dirname(outfile), (err) => {
      assert.ifError(err, 'no error');
      const files = fs.readdirSync(path.dirname(outfile))
        .filter((filename) => {
          return path.extname(filename) === '.index';
        });

      assert.equal(files.length, 0, 'does not contain pre-existing index');
      rimraf(path.dirname(outfile), (err) => {
        assert.end(err);
      });
    });
  });
});
