var test = require('tape'),
    splitToParts = require('../parts'),
    fs = require('fs'),
    os = require('os'),
    path = require('path'),
    crypto = require('crypto');

function randomFile(mbs, callback) {
  var filepath = path.join(os.tmpdir(), crypto.randomBytes(8).toString('hex')),
      tmpfile = fs.createWriteStream(filepath),
      data = crypto.pseudoRandomBytes(1024 * 1024),
      i;

  tmpfile.on('finish', function() {
    callback(null, filepath);
  });

  for (i = 0; i < mbs; i++) tmpfile.write(data);
  tmpfile.end();
}

test('default path is to split by size', function(assert) {
  var mbs = 22,
      expected = Math.ceil(mbs / 10);

  randomFile(mbs, function(err, filepath) {
    if (err) throw err;
    var info = fs.statSync(filepath);
    info.filetype = 'geojson';

    splitToParts(filepath, info, function(err, parts) {
      assert.ifError(err, 'no error');
      assert.equal(parts, expected, 'expected number of parts');
      fs.unlink(filepath);
      assert.end();
    });
  });
});
