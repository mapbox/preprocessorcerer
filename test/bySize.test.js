var test = require('tape'),
    bySize = require('../parts/bySize'),
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

test('tilejson split per 100MB', function(assert) {
  var mbs = 250,
      expected = Math.ceil(mbs / 100),
      info = {
        size: mbs * 1024 * 1024,
        filetype: 'tilejson'
      };

  randomFile(mbs, function(err, filepath) {
    if (err) throw err;
    bySize(filepath, info, function(err, parts) {
      assert.ifError(err, 'no error');
      assert.equal(parts, expected, 'expected number of parts');
      fs.unlink(filepath);
      assert.end();
    });
  });
});

test('mbtiles split per 100MB', function(assert) {
  var mbs = 250,
      expected = Math.ceil(mbs / 100),
      info = {
        size: mbs * 1024 * 1024,
        filetype: 'mbtiles'
      };

  randomFile(mbs, function(err, filepath) {
    if (err) throw err;
    bySize(filepath, info, function(err, parts) {
      assert.ifError(err, 'no error');
      assert.equal(parts, expected, 'expected number of parts');
      fs.unlink(filepath);
      assert.end();
    });
  });
});

test('serialtiles split per 100MB', function(assert) {
  var mbs = 250,
      expected = Math.ceil(mbs / 100),
      info = {
        size: mbs * 1024 * 1024,
        filetype: 'serialtiles'
      };

  randomFile(mbs, function(err, filepath) {
    if (err) throw err;
    bySize(filepath, info, function(err, parts) {
      assert.ifError(err, 'no error');
      assert.equal(parts, expected, 'expected number of parts');
      fs.unlink(filepath);
      assert.end();
    });
  });
});

test('pretiled max at 50 parts', function(assert) {
  var mbs = 5100,
      expected = 50,
      info = {
        size: mbs * 1024 * 1024,
        filetype: 'serialtiles'
      };

  randomFile(mbs, function(err, filepath) {
    if (err) throw err;
    bySize(filepath, info, function(err, parts) {
      assert.ifError(err, 'no error');
      assert.equal(parts, expected, 'expected number of parts');
      fs.unlink(filepath);
      assert.end();
    });
  });
});

test('zip split per 10MB', function(assert) {
  var mbs = 25,
      expected = Math.ceil(mbs / 10),
      info = {
        size: mbs * 1024 * 1024,
        filetype: 'zip'
      };

  randomFile(mbs, function(err, filepath) {
    if (err) throw err;
    bySize(filepath, info, function(err, parts) {
      assert.ifError(err, 'no error');
      assert.equal(parts, expected, 'expected number of parts');
      fs.unlink(filepath);
      assert.end();
    });
  });
});

test('gpx split per 10MB', function(assert) {
  var mbs = 25,
      expected = Math.ceil(mbs / 10),
      info = {
        size: mbs * 1024 * 1024,
        filetype: 'gpx'
      };

  randomFile(mbs, function(err, filepath) {
    if (err) throw err;
    bySize(filepath, info, function(err, parts) {
      assert.ifError(err, 'no error');
      assert.equal(parts, expected, 'expected number of parts');
      fs.unlink(filepath);
      assert.end();
    });
  });
});

test('kml split per 10MB', function(assert) {
  var mbs = 25,
      expected = Math.ceil(mbs / 10),
      info = {
        size: mbs * 1024 * 1024,
        filetype: 'kml'
      };

  randomFile(mbs, function(err, filepath) {
    if (err) throw err;
    bySize(filepath, info, function(err, parts) {
      assert.ifError(err, 'no error');
      assert.equal(parts, expected, 'expected number of parts');
      fs.unlink(filepath);
      assert.end();
    });
  });
});

test('geojson split per 10MB', function(assert) {
  var mbs = 25,
      expected = Math.ceil(mbs / 10),
      info = {
        size: mbs * 1024 * 1024,
        filetype: 'geojson'
      };

  randomFile(mbs, function(err, filepath) {
    if (err) throw err;
    bySize(filepath, info, function(err, parts) {
      assert.ifError(err, 'no error');
      assert.equal(parts, expected, 'expected number of parts');
      fs.unlink(filepath);
      assert.end();
    });
  });
});

test('csv split per 10MB', function(assert) {
  var mbs = 25,
      expected = Math.ceil(mbs / 10),
      info = {
        size: mbs * 1024 * 1024,
        filetype: 'csv'
      };

  randomFile(mbs, function(err, filepath) {
    if (err) throw err;
    bySize(filepath, info, function(err, parts) {
      assert.ifError(err, 'no error');
      assert.equal(parts, expected, 'expected number of parts');
      fs.unlink(filepath);
      assert.end();
    });
  });
});

test('tif split per 10MB', function(assert) {
  var mbs = 25,
      expected = Math.ceil(mbs / 10),
      info = {
        size: mbs * 1024 * 1024,
        filetype: 'tif'
      };

  randomFile(mbs, function(err, filepath) {
    if (err) throw err;
    bySize(filepath, info, function(err, parts) {
      assert.ifError(err, 'no error');
      assert.equal(parts, expected, 'expected number of parts');
      fs.unlink(filepath);
      assert.end();
    });
  });
});

test('untiled max at 50 parts', function(assert) {
  var mbs = 510,
      expected = 50,
      info = {
        size: mbs * 1024 * 1024,
        filetype: 'geojson'
      };

  randomFile(mbs, function(err, filepath) {
    if (err) throw err;
    bySize(filepath, info, function(err, parts) {
      assert.ifError(err, 'no error');
      assert.equal(parts, expected, 'expected number of parts');
      fs.unlink(filepath);
      assert.end();
    });
  });
});

test('unrecognized file type in 1 part', function(assert) {
  var mbs = 510,
      expected = 1,
      info = {
        size: mbs * 1024 * 1024,
        filetype: 'tm2z'
      };

  randomFile(mbs, function(err, filepath) {
    if (err) throw err;
    bySize(filepath, info, function(err, parts) {
      assert.ifError(err, 'no error');
      assert.equal(parts, expected, 'expected number of parts');
      fs.unlink(filepath);
      assert.end();
    });
  });
});
