var test = require('tape'),
    path = require('path'),
    fs = require('fs'),
    os = require('os'),
    crypto = require('crypto'),
    preprocess = require('..');

test('preprocesses', function(assert) {
  var infile = path.resolve(__dirname, 'fixtures', 'wgs84.tif'),
      tmpfile = path.join(os.tmpdir(), crypto.randomBytes(8).toString('hex'));

  fs.createReadStream(infile)
    .pipe(fs.createWriteStream(tmpfile))
    .on('finish', testProcess);

  function testProcess() {
    preprocess(tmpfile, function(err, outfile, parts) {
      assert.ifError(err, 'no error');
      assert.ok(fs.statSync(outfile), 'outfile exists');
      assert.ok(!isNaN(parts), 'reported a number of parts');
      fs.unlink(tmpfile);
      assert.end();
    });
  }
});
