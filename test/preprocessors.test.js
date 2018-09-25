var test = require('tape');
var fs = require('fs');
var os = require('os');
var path = require('path');
var crypto = require('crypto');
var queue = require('queue-async');
var preprocessorcery = require('../preprocessors');

test('[preprocessorcery] finds preprocessors', function(assert) {
  var files = fs.readdirSync(path.resolve(__dirname, '..', 'preprocessors'))
    .filter(function(filename) {
      return /\.preprocessor\.js$/.test(filename);
    });

  assert.equal(preprocessorcery.preprocessors.length, files.length, 'right number of preprocessors');
  preprocessorcery.preprocessors.forEach(function(preprocessor) {
    assert.ok(typeof preprocessor === 'function', 'exposes a function');
    assert.ok(typeof preprocessor.criteria === 'function', 'exposes a criteria function');
  });

  assert.end();
});

test('[preprocessorcery] finds applicable preprocessors', function(assert) {
  var geojson = path.resolve(__dirname, 'fixtures', 'valid.geojson');
  var geojsonInfo = fs.statSync(geojson);
  var tif = path.resolve(__dirname, 'fixtures', 'wgs84.tif');
  var tifInfo = fs.statSync(tif);
  var corrupttif = path.resolve(__dirname, 'fixtures', 'corrupt.tif');
  var corrupttifInfo = fs.statSync(corrupttif);
  geojsonInfo.filetype = 'geojson';
  tifInfo.filetype = 'tif';
  corrupttifInfo.filetype = 'tif';

  queue()
    .defer(preprocessorcery.applicable, geojson, geojsonInfo)
    .defer(preprocessorcery.applicable, tif, tifInfo)
    .defer(preprocessorcery.applicable, corrupttif, corrupttifInfo)
    .await(function(err, geojsonResult, tifResult, corrupttifResult) {
      assert.ifError(err, 'no errors');
      assert.equal(geojsonResult.length, 0, 'no geojson preprocessors');

      // assert.equal(tifResult.length, 2, '2 tif preprocessors');
      assert.equal(tifResult.length, 1, '1 tif preprocessor');
      assert.equal(corrupttifResult.length, 1, '1 tif preprocessors');
      assert.end();
    });
});

test('[preprocessorcery] describes preprocessing steps', function(assert) {
  var tif = path.resolve(__dirname, 'fixtures', 'wgs84.tif');
  var info = fs.statSync(tif);
  info.filetype = 'tif';

  preprocessorcery.descriptions(tif, info, function(err, descriptions) {
    assert.ifError(err, 'no error');
    assert.deepEqual(
      descriptions,

      // ['Reproject TIFF file to EPSG:3857', 'Generate overviews for TIFF files'],
      ['Reproject TIFF file to EPSG:3857'],
      'expected descriptions'
    );
    assert.end();
  });
});

test('[preprocessorcery] describes preprocessing steps for corrupt TIFF', function(assert) {
  var tif = path.resolve(__dirname, 'fixtures', 'corrupt.tif');
  var info = fs.statSync(tif);
  info.filetype = 'tif';

  preprocessorcery.descriptions(tif, info, function(err, descriptions) {
    assert.ifError(err, 'no error');
    assert.deepEqual(
      descriptions,

      // ['Reproject TIFF file to EPSG:3857', 'Generate overviews for TIFF files'],
      ['TIFF file is corrupt'],
      'expected descriptions'
    );
    assert.end();
  });
});

test('[preprocessorcery] preprocessorize', function(assert) {
  var tif = path.resolve(__dirname, 'fixtures', 'wgs84.tif');
  var tmpfile = path.join(os.tmpdir(), crypto.randomBytes(8).toString('hex'));

  fs.createReadStream(tif)
    .pipe(fs.createWriteStream(tmpfile))
    .on('close', testTmpFile);

  function testTmpFile() {
    var tmpfileInfo = fs.statSync(tmpfile);
    tmpfileInfo.filetype = 'tif';

    preprocessorcery(tmpfile, tmpfileInfo, function(err, outfile) {
      assert.ifError(err, 'no error');
      var indir = path.dirname(tmpfile);
      var outdir = path.dirname(outfile);
      assert.equal(outdir, indir, 'places output files in same directory as input');
      fs.unlinkSync(tmpfile);
      fs.unlinkSync(outfile);
      assert.end();
    });
  }
});

test('[preprocessorcery] preprocessorize corrupt TIFF', function(assert) {
  var tif = path.resolve(__dirname, 'fixtures', 'corrupt.tif');
  var tmpfile = path.join(os.tmpdir(), crypto.randomBytes(8).toString('hex'));

  fs.createReadStream(tif)
    .pipe(fs.createWriteStream(tmpfile))
    .on('close', testTmpFile);

  function testTmpFile() {
    var tmpfileInfo = fs.statSync(tmpfile);
    tmpfileInfo.filetype = 'tif';

    preprocessorcery(tmpfile, tmpfileInfo, function(err) {
      assert.equal(err.code, 'EINVALID');
      fs.unlink(tmpfile);
      assert.end();
    });
  }
});
