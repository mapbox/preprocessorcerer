'use strict';
const test = require('tape');
const path = require('path');
const os = require('os');
const fs = require('fs');
const crypto = require('crypto');
const mkdirp = require('mkdirp');
const rimraf = require('rimraf');
const exec = require('child_process').exec;
const togeojson = require('../preprocessors/togeojson-kml.preprocessor');

// Perform all preprocessorcery in a temporary directory. Otherwise output files
// with random names will litter the fixture directory
function tmpdir(callback) {
  let dir = path.join(os.tmpdir(), crypto.randomBytes(8).toString('hex'));
  const fixtureDir = path.resolve(__dirname, 'fixtures', 'kml');
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
  }
  else {
    mkdirp(dir, (err) => {
      if (err) return callback(err);
      callback(null, dir);
    });
  }
}

test('[KML togeojson] fails duplicate layer names', (assert) => {
  const infile = path.resolve(__dirname, 'fixtures', 'kml', 'fail-duplicate-layer-names.kml');

  tmpdir((err, outdir) => {
    togeojson(infile, outdir, (err) => {
      assert.ok(err, 'error properly handled');
      assert.equal(err.message, 'Duplicate layer names: \'duplicate layer name\' found 2 times, \'layer 2\' found 2 times', 'expected error message');
      rimraf(outdir, (err) => {
        assert.end(err);
      });
    });
  });
});

test('[KML togeojson] fails empty features only', (assert) => {
  const infile = path.resolve(__dirname, 'fixtures', 'kml', 'fail-empty-features-only.kml');

  tmpdir((err, outdir) => {
    togeojson(infile, outdir, (err) => {
      assert.ok(err, 'error properly handled');
      assert.equal(err.message, 'KML does not contain any valid features', 'expected error message');
      rimraf(outdir, (err) => {
        assert.end(err);
      });
    });
  });
});

test('[KML togeojson] fails empty features only', (assert) => {
  const infile = path.resolve(__dirname, 'fixtures', 'kml', 'fail-invalid.kml');

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

test('[KML togeojson] fails empty features only', (assert) => {
  const infile = path.resolve(__dirname, 'fixtures', 'kml', 'fail-more-than-15-layers.kml');

  tmpdir((err, outdir) => {
    togeojson(infile, outdir, (err) => {
      assert.ok(err, 'error properly handled');
      assert.equal(err.message, '22 layers found. Maximum of 15 layers allowed.', 'expected error message');
      rimraf(outdir, (err) => {
        assert.end(err);
      });
    });
  });
});

test('[KML togeojson] convert, index, and archive valid kml', (assert) => {
  const infile = path.resolve(__dirname, 'fixtures', 'kml', 'ok-layers-folders-emptygeometries.kml');
  togeojson.index_worthy_size = 100; // 100 bytes

  tmpdir((err, outdir) => {
    togeojson(infile, outdir, (err) => {
      const originalfile = fs.readFileSync(infile);
      const archivedfile = fs.readFileSync(path.join(outdir, 'archived.kml'));
      assert.ifError(err, 'no error');
      assert.ok(fs.existsSync(path.join(outdir, 'folder-01-01.geojson')), 'converted layer');
      assert.ok(fs.existsSync(path.join(outdir, 'folder-01-01.geojson.index')), 'created index');
      assert.ok(fs.existsSync(path.join(outdir, 'folder-01.geojson')), 'converted layer');
      assert.ok(fs.existsSync(path.join(outdir, 'folder-01.geojson.index')), 'created index');
      assert.ok(fs.existsSync(path.join(outdir, 'folder-02.geojson')), 'converted layer');
      assert.ok(fs.existsSync(path.join(outdir, 'folder-02.geojson.index')), 'created index');
      assert.ok(fs.existsSync(path.join(outdir, 'my-test.geojson')), 'converted layer');
      assert.ok(fs.existsSync(path.join(outdir, 'my-test.geojson.index')), 'created index');
      assert.ok(fs.existsSync(path.join(outdir, 'metadata.json')), 'added metadata of original kml');
      assert.ok(fs.existsSync(path.join(outdir, 'archived.kml')), 'original file archived');
      assert.equal(originalfile.compare(archivedfile), 0, 'file contents are the same');
      rimraf(outdir, (err) => {
        assert.end(err);
      });
    });
  });
});

test('[KML togeojson] handle layers with special characters', (assert) => {
  const infile = path.resolve(__dirname, 'fixtures', 'kml', 'ok-special-character-layer.kml');
  togeojson.index_worthy_size = 100; // 100 bytes

  tmpdir((err, outdir) => {
    togeojson(infile, outdir, (err) => {
      assert.ifError(err, 'no error');
      assert.ok(fs.existsSync(path.join(outdir, 'special_characters_in___this_.layer.geojson')), 'converted layer');
      assert.ok(fs.existsSync(path.join(outdir, 'special_characters_in___this_.layer.geojson.index')), 'created index');
      assert.ok(fs.existsSync(path.join(outdir, 'special_09characters_in___this_layer.geojson')), 'converted layer');
      assert.ok(fs.existsSync(path.join(outdir, 'special_09characters_in___this_layer.geojson.index')), 'created index');
      assert.ok(fs.existsSync(path.join(outdir, '_tmp_dir_file_path_test_layer.geojson')), 'converted layer');
      assert.ok(fs.existsSync(path.join(outdir, '_tmp_dir_file_path_test_layer.geojson.index')), 'created index');
      assert.ok(fs.existsSync(path.join(outdir, 'metadata.json')), 'added metadata of original kml');
      rimraf(outdir, (err) => {
        assert.end(err);
      });
    });
  });
});

test.only('[KML togeojson] allows invalid geometry to sneak through', (assert) => {
  const infile = path.resolve(__dirname, 'fixtures', 'kml', 'ok-invalid-geometry.kml');
  togeojson.index_worthy_size = 100; // 100 bytes

  tmpdir((err, outdir) => {
    togeojson(infile, outdir, (err) => {
      assert.ifError(err, 'no error');
      assert.ok(fs.existsSync(path.join(outdir, 'layername.geojson')), 'converted layer');
      const gj = JSON.parse(fs.readFileSync(path.join(outdir, 'layername.geojson'), 'utf-8'));
      assert.equal(gj.features.length, 2, 'has two features, even though one is technically invalid geometry');
      assert.ok(fs.existsSync(path.join(outdir, 'layername.geojson.index')), 'created index');
      assert.ok(fs.existsSync(path.join(outdir, 'metadata.json')), 'added metadata of original kml');
      assert.ok(fs.existsSync(path.join(outdir, 'archived.kml')), 'added archive kml');
      rimraf(outdir, (err) => {
        assert.end(err);
      });
    });
  });
});
