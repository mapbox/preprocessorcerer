'use strict';
const test = require('tape');
const fs = require('fs');
const os = require('os');
const path = require('path');
const crypto = require('crypto');
const queue = require('queue-async');
const preprocessorcery = require('../preprocessors');

test('[preprocessorcery] finds preprocessors', (assert) => {
  const files = fs.readdirSync(path.resolve(__dirname, '..', 'preprocessors'))
    .filter((filename) => {
      return /\.preprocessor\.js$/.test(filename);
    });

  assert.equal(preprocessorcery.preprocessors.length, files.length, 'right number of preprocessors');
  preprocessorcery.preprocessors.forEach((preprocessor) => {
    assert.ok(typeof preprocessor === 'function', 'exposes a function');
    assert.ok(typeof preprocessor.criteria === 'function', 'exposes a criteria function');
  });

  assert.end();
});

test('[preprocessorcery] finds applicable preprocessors', (assert) => {
  const geojson = path.resolve(__dirname, 'fixtures', 'valid.geojson');
  const geojsonInfo = fs.statSync(geojson);
  const tif = path.resolve(__dirname, 'fixtures', 'wgs84.tif');
  const tifInfo = fs.statSync(tif);
  geojsonInfo.filetype = 'geojson';
  tifInfo.filetype = 'tif';

  queue()
    .defer(preprocessorcery.applicable, geojson, geojsonInfo)
    .defer(preprocessorcery.applicable, tif, tifInfo)
    .await((err, geojsonResult, tifResult) => {
      assert.ifError(err, 'no errors');
      assert.equal(geojsonResult.length, 0, 'no geojson preprocessors');

      // assert.equal(tifResult.length, 2, '2 tif preprocessors');
      assert.equal(tifResult.length, 1, '1 tif preprocessor');
      assert.end();
    });
});

test('[preprocessorcery] describes preprocessing steps', (assert) => {
  const tif = path.resolve(__dirname, 'fixtures', 'wgs84.tif');
  const info = fs.statSync(tif);
  info.filetype = 'tif';

  preprocessorcery.descriptions(tif, info, (err, descriptions) => {
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

test('[preprocessorcery] preprocessorize', (assert) => {
  const tif = path.resolve(__dirname, 'fixtures', 'wgs84.tif');
  const tmpfile = path.join(os.tmpdir(), crypto.randomBytes(8).toString('hex'));

  fs.createReadStream(tif)
    .pipe(fs.createWriteStream(tmpfile))
    .on('close', testTmpFile);

  function testTmpFile() {
    const tmpfileInfo = fs.statSync(tmpfile);
    tmpfileInfo.filetype = 'tif';

    preprocessorcery(tmpfile, tmpfileInfo, (err, outfile) => {
      assert.ifError(err, 'no error');
      const indir = path.dirname(tmpfile);
      const outdir = path.dirname(outfile);
      assert.equal(outdir, indir, 'places output files in same directory as input');
      fs.unlinkSync(tmpfile);
      fs.unlinkSync(outfile);
      assert.end();
    });
  }
});
