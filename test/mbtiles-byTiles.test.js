var test = require('tape');
var mbtilesByTiles = require('../parts/mbtiles-byTiles');
var path = require('path');
var makeMbtiles = require('./fixtures/mbtiles-count/make-mbtiles');
var os = require('os');
var fs = require('fs');
var crypto = require('crypto');

test('correct number of parts for mbtiles without grids table', function(assert) {
  var fixture = path.join(os.tmpdir(), crypto.randomBytes(8).toString('hex'));
  makeMbtiles(fixture, 305000, function(err) {
    if (err) throw err;

    mbtilesByTiles(fixture, { filetype: 'mbtiles' }, function(err, parts) {
      assert.ifError(err, 'no error');
      assert.equal(parts, 4, 'four parts');
      fs.unlink(fixture);
      assert.end();
    });
  });
});

test('correct number of parts for mbtiles without tiles table', function(assert) {
  var fixture = path.resolve(__dirname, 'fixtures', 'valid.grids.mbtiles');
  var info = fs.statSync(fixture);
  info.filetype = 'mbtiles';
  mbtilesByTiles(fixture, info, function(err, parts) {
    assert.ifError(err, 'no error');
    assert.equal(parts, 1, 'one part');
    assert.end();
  });
});

test('correct number of parts for mbtiles with both tables', function(assert) {
  var fixture = path.resolve(__dirname, 'fixtures', 'valid-tilesgrid.mbtiles');
  var info = fs.statSync(fixture);
  info.filetype = 'mbtiles';
  mbtilesByTiles(fixture, info, function(err, parts) {
    assert.ifError(err, 'no error');
    assert.equal(parts, 1, 'one part');
    assert.end();
  });
});
