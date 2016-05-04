var test = require('tape');
var path = require('path');
var fs = require('fs');
var os = require('os');
var crypto = require('crypto');
var preprocess = require('..');
var preprocessors = require('../preprocessors/index.js');
var index = require('../preprocessors/spatial-index.preprocessor');

test('[index] preprocesses', function(assert) {
  var infile = path.resolve(__dirname, 'fixtures', 'wgs84.tif');
  var tmpfile = path.join(os.tmpdir(), crypto.randomBytes(8).toString('hex'));

  fs.createReadStream(infile)
    .pipe(fs.createWriteStream(tmpfile))
    .on('finish', testProcess);

  function testProcess() {
    preprocess(tmpfile, function(err, outfile, parts, descriptions) {
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

test('[index] preprocesses and creates index last', function(assert) {
  var infile = path.resolve(__dirname, 'fixtures', 'bom.geojson');
  var tmpfile = path.join(os.tmpdir(), crypto.randomBytes(8).toString('hex'));

  fs.createReadStream(infile)
    .pipe(fs.createWriteStream(tmpfile))
    .on('finish', testProcess);

  function testProcess() {
    preprocessors.descriptions(tmpfile, { filetype: 'geojson', size: index.index_worthy_size + 1 }, function(err, descriptions) {
      assert.ifError(err, 'no error');
      assert.ok(Array.isArray(descriptions), 'returns array of descriptions');
      assert.equal(descriptions[descriptions.length - 1], 'Add a spatial index to GeoJSON or CSV');
      fs.unlinkSync(tmpfile);
      assert.end();
    });
  }
});
