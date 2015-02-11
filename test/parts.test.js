var test = require('tape');
var splitToParts = require('../parts');
var fs = require('fs');
var os = require('os');
var path = require('path');
var crypto = require('crypto');
var makeMbtiles = require('./fixtures/mbtiles-count/make-mbtiles');

function randomFile(mbs, callback) {
  var filepath = path.join(os.tmpdir(), crypto.randomBytes(8).toString('hex'));
  var tmpfile = fs.createWriteStream(filepath);
  var data = crypto.pseudoRandomBytes(1024 * 1024);
  var i;

  tmpfile.on('finish', function() {
    callback(null, filepath);
  });

  for (i = 0; i < mbs; i++) tmpfile.write(data);
  tmpfile.end();
}

test('mbtiles file is split by tiles', function(assert) {
  var fixture = path.join(os.tmpdir(), crypto.randomBytes(8).toString('hex'));
  makeMbtiles(fixture, 100001, function(err) {
    assert.ifError(err, 'no error');
    if (err) return assert.end();
    var info = fs.statSync(fixture);
    info.filetype = 'mbtiles';
    splitToParts(fixture, info, function(err, parts) {
      assert.ifError(err, 'no error');
      assert.equal(parts, 2, 'expected number of parts');
      fs.unlink(fixture);
      assert.end();
    });
  });
});

test('default path is to split by size', function(assert) {
  var mbs = 22;
  var expected = Math.ceil(mbs / 10);

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
