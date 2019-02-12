'use strict';
const test = require('tape');
const bySize = require('../parts/bySize');
const fs = require('fs');
const os = require('os');
const path = require('path');
const crypto = require('crypto');

function randomFile(mbs, callback) {
  const filepath = path.join(os.tmpdir(), crypto.randomBytes(8).toString('hex'));
  const tmpfile = fs.createWriteStream(filepath);
  const data = crypto.pseudoRandomBytes(1024 * 1024);
  let i;

  tmpfile.on('finish', () => {
    callback(null, filepath);
  });

  for (i = 0; i < mbs; i++) tmpfile.write(data);
  tmpfile.end();
}

test('[parts bySize] tilejson split per 100MB', (assert) => {
  const mbs = 250;
  const expected = Math.ceil(mbs / 100);
  const info = {
    size: mbs * 1024 * 1024,
    filetype: 'tilejson'
  };

  randomFile(mbs, (err, filepath) => {
    if (err) throw err;
    bySize(filepath, info, (err, parts) => {
      assert.ifError(err, 'no error');
      assert.equal(parts, expected, 'expected number of parts');
      fs.unlink(filepath);
      assert.end();
    });
  });
});

test('[parts bySize] mbtiles split per 100MB', (assert) => {
  const mbs = 250;
  const expected = Math.ceil(mbs / 100);
  const info = {
    size: mbs * 1024 * 1024,
    filetype: 'mbtiles'
  };

  randomFile(mbs, (err, filepath) => {
    if (err) throw err;
    bySize(filepath, info, (err, parts) => {
      assert.ifError(err, 'no error');
      assert.equal(parts, expected, 'expected number of parts');
      fs.unlink(filepath);
      assert.end();
    });
  });
});

test('[parts bySize] serialtiles split per 100MB', (assert) => {
  const mbs = 250;
  const expected = Math.ceil(mbs / 100);
  const info = {
    size: mbs * 1024 * 1024,
    filetype: 'serialtiles'
  };

  randomFile(mbs, (err, filepath) => {
    if (err) throw err;
    bySize(filepath, info, (err, parts) => {
      assert.ifError(err, 'no error');
      assert.equal(parts, expected, 'expected number of parts');
      fs.unlink(filepath);
      assert.end();
    });
  });
});

test('[parts bySize] pretiled max at 50 parts', (assert) => {
  const mbs = 5100;
  const expected = 50;
  const info = {
    size: mbs * 1024 * 1024,
    filetype: 'serialtiles'
  };

  randomFile(mbs, (err, filepath) => {
    if (err) throw err;
    bySize(filepath, info, (err, parts) => {
      assert.ifError(err, 'no error');
      assert.equal(parts, expected, 'expected number of parts');
      fs.unlink(filepath);
      assert.end();
    });
  });
});

test('[parts bySize] zip split per 10MB', (assert) => {
  const mbs = 25;
  const expected = Math.ceil(mbs / 10);
  const info = {
    size: mbs * 1024 * 1024,
    filetype: 'zip'
  };

  randomFile(mbs, (err, filepath) => {
    if (err) throw err;
    bySize(filepath, info, (err, parts) => {
      assert.ifError(err, 'no error');
      assert.equal(parts, expected, 'expected number of parts');
      fs.unlink(filepath);
      assert.end();
    });
  });
});

test('[parts bySize] gpx split per 10MB', (assert) => {
  const mbs = 25;
  const expected = Math.ceil(mbs / 10);
  const info = {
    size: mbs * 1024 * 1024,
    filetype: 'gpx'
  };

  randomFile(mbs, (err, filepath) => {
    if (err) throw err;
    bySize(filepath, info, (err, parts) => {
      assert.ifError(err, 'no error');
      assert.equal(parts, expected, 'expected number of parts');
      fs.unlink(filepath);
      assert.end();
    });
  });
});

test('[parts bySize] kml split per 10MB', (assert) => {
  const mbs = 25;
  const expected = Math.ceil(mbs / 10);
  const info = {
    size: mbs * 1024 * 1024,
    filetype: 'kml'
  };

  randomFile(mbs, (err, filepath) => {
    if (err) throw err;
    bySize(filepath, info, (err, parts) => {
      assert.ifError(err, 'no error');
      assert.equal(parts, expected, 'expected number of parts');
      fs.unlink(filepath);
      assert.end();
    });
  });
});

test('[parts bySize] geojson split per 10MB', (assert) => {
  const mbs = 25;
  const expected = Math.ceil(mbs / 10);
  const info = {
    size: mbs * 1024 * 1024,
    filetype: 'geojson'
  };

  randomFile(mbs, (err, filepath) => {
    if (err) throw err;
    bySize(filepath, info, (err, parts) => {
      assert.ifError(err, 'no error');
      assert.equal(parts, expected, 'expected number of parts');
      fs.unlink(filepath);
      assert.end();
    });
  });
});

test('[parts bySize] csv split per 10MB', (assert) => {
  const mbs = 25;
  const expected = Math.ceil(mbs / 10);
  const info = {
    size: mbs * 1024 * 1024,
    filetype: 'csv'
  };

  randomFile(mbs, (err, filepath) => {
    if (err) throw err;
    bySize(filepath, info, (err, parts) => {
      assert.ifError(err, 'no error');
      assert.equal(parts, expected, 'expected number of parts');
      fs.unlink(filepath);
      assert.end();
    });
  });
});

test('[parts bySize] tif split per 1.5GB', (assert) => {
  const mbs = 1500;
  const expected = Math.ceil(mbs / 1500);
  const info = {
    size: mbs * 1024 * 1024,
    filetype: 'tif'
  };

  randomFile(mbs, (err, filepath) => {
    if (err) throw err;
    bySize(filepath, info, (err, parts) => {
      assert.ifError(err, 'no error');
      assert.equal(parts, expected, 'expected number of parts');
      fs.unlink(filepath);
      assert.end();
    });
  });
});

test('[parts bySize] untiled max at 50 parts', (assert) => {
  const mbs = 510;
  const expected = 50;
  const info = {
    size: mbs * 1024 * 1024,
    filetype: 'geojson'
  };

  randomFile(mbs, (err, filepath) => {
    if (err) throw err;
    bySize(filepath, info, (err, parts) => {
      assert.ifError(err, 'no error');
      assert.equal(parts, expected, 'expected number of parts');
      fs.unlink(filepath);
      assert.end();
    });
  });
});

test('[parts bySize] unrecognized file type in 1 part', (assert) => {
  const mbs = 510;
  const expected = 1;
  const info = {
    size: mbs * 1024 * 1024,
    filetype: 'tm2z'
  };

  randomFile(mbs, (err, filepath) => {
    if (err) throw err;
    bySize(filepath, info, (err, parts) => {
      assert.ifError(err, 'no error');
      assert.equal(parts, expected, 'expected number of parts');
      fs.unlink(filepath);
      assert.end();
    });
  });
});
