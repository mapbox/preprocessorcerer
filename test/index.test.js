var test = require('tape');
var path = require('path');
var fs = require('fs');
var os = require('os');
var crypto = require('crypto');
var preprocess = require('..');

test('preprocesses', function(assert) {
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
      fs.unlink(tmpfile);
      assert.end();
    });
  }
});
