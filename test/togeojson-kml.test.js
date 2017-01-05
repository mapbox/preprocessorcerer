var test = require('tape');
var path = require('path');
var os = require('os');
var fs = require('fs');
var crypto = require('crypto');
var mkdirp = require('mkdirp');
var rimraf = require('rimraf');
var exec = require('child_process').exec;
var togeojson = require('../preprocessors/togeojson-kml.preprocessor');

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
    var cmd = [copy_cmd, fixtureDir, dir].join(' ');
    exec(cmd, function(err) {
      if (err) return callback(err);
      callback(null, dir);
    });
  }
  else {
    mkdirp(dir, function(err) {
      if (err) return callback(err);
      callback(null, dir);
    });
  }
}

test('[KML togeojson] fails duplicate layer names', function(assert) {
  var infile = path.resolve(__dirname, 'fixtures', 'kml', 'fail-duplicate-layer-names.kml');

  tmpdir(function(err, outdir) {
    togeojson(infile, outdir, function(err) {
      assert.ok(err, 'error properly handled');
      assert.equal(err.message, 'Duplicate layer names: \'duplicate layer name\' found 2 times, \'layer 2\' found 2 times', 'expected error message');
      rimraf(outdir, function(err) {
        assert.end(err);
      });
    });
  });
});

test('[KML togeojson] fails empty features only', function(assert) {
  var infile = path.resolve(__dirname, 'fixtures', 'kml', 'fail-empty-features-only.kml');

  tmpdir(function(err, outdir) {
    togeojson(infile, outdir, function(err) {
      assert.ok(err, 'error properly handled');
      assert.equal(err.message, 'KML does not contain any valid features', 'expected error message');
      rimraf(outdir, function(err) {
        assert.end(err);
      });
    });
  });
});

test('[KML togeojson] fails empty features only', function(assert) {
  var infile = path.resolve(__dirname, 'fixtures', 'kml', 'fail-invalid.kml');

  tmpdir(function(err, outdir) {
    togeojson(infile, outdir, function(err) {
      assert.ok(err, 'error properly handled');
      assert.equal(err.message, 'Error: Error opening dataset', 'expected error message');
      rimraf(outdir, function(err) {
        assert.end(err);
      });
    });
  });
});

test('[KML togeojson] fails empty features only', function(assert) {
  var infile = path.resolve(__dirname, 'fixtures', 'kml', 'fail-more-than-15-layers.kml');

  tmpdir(function(err, outdir) {
    togeojson(infile, outdir, function(err) {
      assert.ok(err, 'error properly handled');
      assert.equal(err.message, '22 layers found. Maximum of 15 layers allowed.', 'expected error message');
      rimraf(outdir, function(err) {
        assert.end(err);
      });
    });
  });
});

test.only('[KML togeojson] convert, index, and archive valid kml', function(assert) {
  var infile = path.resolve(__dirname, 'fixtures', 'kml', 'ok-layers-folders-emptygeometries.kml');
  togeojson.index_worthy_size = 100; // 100 bytes

  tmpdir(function(err, outdir) {
    togeojson(infile, outdir, function(err) {
      var originalfile = fs.readFileSync(infile);
      var archivedfile = fs.readFileSync(path.join(outdir, 'archived.kml'));
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
      rimraf(outdir, function(err) {
        assert.end(err);
      });
    });
  });
});

test('[KML togeojson] handle layers with special characters', function(assert) {
  var infile = path.resolve(__dirname, 'fixtures', 'kml', 'ok-special-character-layer.kml');
  togeojson.index_worthy_size = 100; // 100 bytes

  tmpdir(function(err, outdir) {
    togeojson(infile, outdir, function(err) {
      assert.ifError(err, 'no error');
      assert.ok(fs.existsSync(path.join(outdir, 'special_characters_in___this_layer.geojson')), 'converted layer');
      assert.ok(fs.existsSync(path.join(outdir, 'special_characters_in___this_layer.geojson.index')), 'created index');
      assert.ok(fs.existsSync(path.join(outdir, 'special_09characters_in___this_layer.geojson')), 'converted layer');
      assert.ok(fs.existsSync(path.join(outdir, 'special_09characters_in___this_layer.geojson.index')), 'created index');
      assert.ok(fs.existsSync(path.join(outdir, 'metadata.json')), 'added metadata of original kml');
      rimraf(outdir, function(err) {
        assert.end(err);
      });
    });
  });
});
