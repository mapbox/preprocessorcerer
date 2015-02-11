var test = require('tape');
var mbtilesByTiles = require('../parts/mbtiles-byTiles');
var path = require('path');
var makeMbtiles = require('./fixtures/mbtiles-count/make-mbtiles');
var os = require('os');
var fs = require('fs');
var crypto = require('crypto');
var fixture = path.join(os.tmpdir(), crypto.randomBytes(8).toString('hex'));

test('correct number of parts', function(assert) {
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
