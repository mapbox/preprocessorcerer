var test = require('tape');
var path = require('path');
var fs = require('fs');
var serialtilesByTiles = require('../parts/serialtiles-byTiles');

test('correct number of parts', function(assert) {
  var fixture = path.resolve(__dirname, 'fixtures', '423567-lines.gz');
  var info = fs.statSync(fixture);
  info.filetype = 'serialtiles';
  serialtilesByTiles(fixture, info, function(err, parts) {
    assert.ifError(err, 'no error');
    assert.equal(parts, 3, 'three parts');
    assert.end();
  });
});
