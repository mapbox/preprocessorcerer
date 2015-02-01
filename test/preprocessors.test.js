var test = require('tape'),
    fs = require('fs'),
    os = require('os'),
    path = require('path'),
    crypto = require('crypto'),
    queue = require('queue-async'),
    preprocessorcery = require('../preprocessors');

test('finds preprocessors', function(assert) {
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

test('finds applicable preprocessors', function(assert) {
  var geojson = path.resolve(__dirname, 'fixtures', 'valid.geojson'),
      geojsonInfo = fs.statSync(geojson),
      tif = path.resolve(__dirname, 'fixtures', 'wgs84.tif'),
      tifInfo = fs.statSync(tif);
  geojsonInfo.filetype = 'geojson';
  tifInfo.filetype = 'tif';

  queue()
    .defer(preprocessorcery.applicable, geojson, geojsonInfo)
    .defer(preprocessorcery.applicable, tif, tifInfo)
    .await(function(err, geojsonResult, tifResult) {
      assert.ifError(err, 'no errors');
      assert.equal(geojsonResult.length, 0, 'no geojson preprocessors');
      assert.equal(tifResult.length, 1, '1 tif preprocessor');
      assert.end();
    });
});

test('describes preprocessing steps', function(assert) {
  var tif = path.resolve(__dirname, 'fixtures', 'wgs84.tif'),
      info = fs.statSync(tif);
  info.filetype = 'tif';

  preprocessorcery.descriptions(tif, info, function(err, descriptions) {
    assert.ifError(err, 'no error');
    assert.deepEqual(descriptions, ['Reproject TIFF file to EPSG:3857'], 'expected descriptions');
    assert.end();
  });
});

test('preprocessorize', function(assert) {
  var tif = path.resolve(__dirname, 'fixtures', 'wgs84.tif'),
      tmpfile = path.join(os.tmpdir(), crypto.randomBytes(8).toString('hex'));

  fs.createReadStream(tif)
    .pipe(fs.createWriteStream(tmpfile))
    .on('close', testTmpFile);

  function testTmpFile() {
    var tmpfileInfo = fs.statSync(tmpfile);
    tmpfileInfo.filetype = 'tif';

    preprocessorcery(tmpfile, tmpfileInfo, function(err, outfile) {
      assert.ifError(err, 'no error');
      var indir = path.dirname(tmpfile),
          outdir = path.dirname(outfile);
      assert.equal(outdir, indir, 'places output files in same directory as input');
      fs.unlink(tmpfile);
      assert.end();
    });
  }
});
