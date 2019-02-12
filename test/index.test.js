'use strict';
const test = require('tape');
const path = require('path');
const fs = require('fs');
const os = require('os');
const crypto = require('crypto');
const preprocess = require('..');
const preprocessors = require('../preprocessors/index.js');
const index = require('../preprocessors/spatial-index.preprocessor');

test('[index] preprocesses', (assert) => {
  const infile = path.resolve(__dirname, 'fixtures', 'wgs84.tif');
  const tmpfile = path.join(os.tmpdir(), crypto.randomBytes(8).toString('hex'));

  fs.createReadStream(infile)
    .pipe(fs.createWriteStream(tmpfile))
    .on('finish', testProcess);

  function testProcess() {
    preprocess(tmpfile, (err, valid, message, outfile, parts, descriptions) => {
      assert.ifError(err, 'no error');
      assert.ok(fs.statSync(outfile), 'outfile exists');
      assert.ok(!isNaN(parts), 'reported a number of parts');
      assert.ok(Array.isArray(descriptions), 'returns array of descriptions');
      fs.unlinkSync(outfile);
      fs.unlinkSync(tmpfile);
      assert.end();
    });
  }
});

test('[index] preprocesses and creates index last', (assert) => {
  const infile = path.resolve(__dirname, 'fixtures', 'bom.geojson');
  const tmpfile = path.join(os.tmpdir(), crypto.randomBytes(8).toString('hex'));

  fs.createReadStream(infile)
    .pipe(fs.createWriteStream(tmpfile))
    .on('finish', testProcess);

  function testProcess() {
    preprocessors.descriptions(tmpfile, { filetype: 'geojson', size: index.index_worthy_size + 1 }, (err, descriptions) => {
      assert.ifError(err, 'no error');
      assert.ok(Array.isArray(descriptions), 'returns array of descriptions');
      assert.equal(descriptions[descriptions.length - 1], 'Add a spatial index to GeoJSON or CSV');
      fs.unlinkSync(tmpfile);
      assert.end();
    });
  }
});
