var test = require('tape');
var path = require('path');
var os = require('os');
var fs = require('fs');
var crypto = require('crypto');
var cruft = require('../preprocessors/mbtiles-cruft.preprocessor');
var MBTiles = require('mbtiles');
var tilelive = require('tilelive');
MBTiles.registerProtocols(tilelive);
var concatStream = require('concat-stream');

test('[mbtiles-cruft] criteria: not an mbtiles file', function(assert) {
  var fixture = path.resolve(__dirname, 'fixtures', 'sm.indexed.shapefile');
  cruft.criteria(fixture, { filetype: 'shp' }, function(err, process) {
    assert.ifError(err, 'no error');
    assert.notOk(process, 'do not process');
    assert.end();
  });
});

test('[mbtiles-cruft] criteria: is an mbtiles file', function(assert) {
  var fixture = path.resolve(__dirname, 'fixtures', 'valid.tiles-grids.mbtiles');
  cruft.criteria(fixture, { filetype: 'mbtiles' }, function(err, process) {
    assert.ifError(err, 'no error');
    assert.ok(process, 'do process');
    assert.end();
  });
});

test('[mbtiles-cruft] runs a clean file', function(assert) {
  var fixture = path.resolve(__dirname, 'fixtures', 'clean.mbtiles');
  var outfile = path.join(os.tmpdir(), crypto.randomBytes(8).toString('hex'));
  cruft(fixture, outfile, function(err) {
    assert.ifError(err, 'no error');
    assert.ok(fs.existsSync(outfile), 'writes output file');

    new MBTiles(fixture, function(err, original) {
      if (err) throw err;
      new MBTiles(outfile, function(err, preprocessed) {
        if (err) throw err;
        compare(original, preprocessed);
      });
    });

    function compare(original, preprocessed) {
      original.createZXYStream()
        .pipe(tilelive.createReadStream(original, { type: 'list' }))
        .pipe(tilelive.serialize())
        .pipe(concatStream({ encoding: 'string' }, function(expected) {
          preprocessed.createZXYStream()
            .pipe(tilelive.createReadStream(preprocessed, { type: 'list' }))
            .pipe(tilelive.serialize())
            .pipe(concatStream({ encoding: 'string' }, function(found) {
              found = found.split('\n').sort();
              expected = expected.split('\n').sort();
              assert.deepEqual(found, expected, 'identical tiles in preprocessed file');
              assert.end();
            }));
        }));
    }
  });
});

test('[mbtiles-cruft] cleans a dirty file', function(assert) {
  var fixture = path.resolve(__dirname, 'fixtures', 'dirty.mbtiles');
  var outfile = path.join(os.tmpdir(), crypto.randomBytes(8).toString('hex'));
  cruft(fixture, outfile, function(err) {
    assert.ifError(err, 'no error');
    assert.ok(fs.existsSync(outfile), 'writes output file');

    new MBTiles(fixture, function(err, original) {
      if (err) throw err;
      new MBTiles(outfile, function(err, preprocessed) {
        if (err) throw err;
        compare(original, preprocessed);
      });
    });

    function compare(original, preprocessed) {
      original.createZXYStream()
        .pipe(tilelive.createReadStream(original, { type: 'list' }))
        .pipe(tilelive.serialize())
        .pipe(concatStream({ encoding: 'string' }, function(expected) {
          preprocessed.createZXYStream()
            .pipe(tilelive.createReadStream(preprocessed, { type: 'list' }))
            .pipe(tilelive.serialize())
            .pipe(concatStream({ encoding: 'string' }, function(found) {
              found = found.split('\n').sort();
              expected = expected.split('\n').sort();
              assert.deepEqual(found, expected, 'identical tiles in preprocessed file');
              checkMapTable(preprocessed);
            }));
        }));
    }

    function checkMapTable(mbtiles) {
      mbtiles._db.get('SELECT COUNT(*) as count from map;', function(err, result) {
        if (err) throw err;
        assert.equal(result.count, 10, 'removed null map entries');
        assert.end();
      });
    }
  });
});
