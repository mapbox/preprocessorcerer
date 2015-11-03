var test = require('tape');
var path = require('path');
var os = require('os');
var fs = require('fs');
var crypto = require('crypto');
var gdal = require('gdal');
var preprocess = require('..');
var exec = require('child_process').exec;
var preprocessorDir = path.resolve(__dirname, '..', 'preprocessors');
var MBtiles = require('mbtiles');

// Perform all preprocessorcery in a temporary directory. Otherwise output files
// with random names will litter the fixture directory
var fixtureDir = path.resolve(__dirname, 'fixtures', 'end2end');
var tmpdir = path.join(os.tmpdir(), crypto.randomBytes(8).toString('hex'));
var cmd = ['cp -r', fixtureDir, tmpdir].join(' ');
exec(cmd, function(err) {
  if (err) throw err;

  // Fixture names indicate which preprocessing steps should be expected
  // Map fixture names to filepaths, expected steps and expected descriptions
  var fixtures = fs.readdirSync(tmpdir)
    .map(function(filename) {
      var basename = path.basename(filename, path.extname(filename));
      var preprocessorNames = basename.split('.');

      var descriptions = preprocessorNames.map(function(name) {
        var preprocessor = require(path.join(preprocessorDir, name + '.preprocessor'));
        return preprocessor.description;
      });

      var filepath = /\.shapefile$/.test(filename) ?
        path.join(tmpdir, filename, basename + '.shp') :
        path.join(tmpdir, filename);

      return {
        name: filename,
        filepath: filepath,
        preprocessors: path.basename(filename, path.extname(filename)).split('.'),
        descriptions: descriptions,
        type: path.extname(filename)
      };
    });

  fixtures.forEach(function(fixture) {
    test('[end2end ' + fixture.name + ']', function(assert) {
      preprocess(fixture.filepath, function(err, outfile, parts, descriptions) {
        assert.ifError(err, 'preprocessed');
        assert.deepEqual(descriptions, fixture.descriptions, 'expected preprocessorcery performed');
        outputCheck(outfile, fixture.type, assert, function() {
          assert.end();
        });
      });
    });
  });
});

// Given only a filetype, what assertions can we make about the outfile?
function outputCheck(outfile, type, assert, callback) {
  assert.ok(fs.existsSync(outfile), 'output file exists');

  var ds;
  var mercator = gdal.SpatialReference.fromEPSG(3857);

  if (type === '.shapefile') {
    ds = gdal.open(outfile);

    // ends up indexed
    var index = fs.readdirSync(outfile).filter(function(filename) {
      return path.extname(filename) === '.index';
    });

    assert.equal(index.length, 1, 'created .index');

    // ends up in epsg:3857
    ds.layers.forEach(function(layer) {
      // https://github.com/mapbox/preprocessorcerer/issues/47
      assert.ok(!layer.srs.isSame(mercator), layer.name + ' projected to spherical mercator');
    });

    return callback();
  }

  if (type === '.geojson') {
    ds = gdal.open(outfile);

    // ends up with no BOM
    var buf = new Buffer(3);
    var fd = fs.openSync(outfile, 'r');
    fs.readSync(fd, buf, 0, 3, 0);
    assert.notOk(buf[0] === 0xef && buf[1] === 0xbb && buf[2] == 0xbf, 'no BOM');

    return callback();
  }

  if (type === '.tif') {
    ds = gdal.open(outfile);

    // ends up in epsg:3857
    assert.ok(ds.srs.isSame(mercator), 'projected to spherical mercator');

    // each band is 8-bit and has overviews
    ds.bands.forEach(function(band) {
      assert.equal(band.dataType, gdal.GDT_Byte, 'band '  + band.id + ' is 8-bit');

      // assert.ok(band.overviews.count() >= 10, 'band ' + band.id + ' has overviews');
    });

    return callback();
  }

  if (type === '.mbtiles') {
    return new MBtiles(outfile, function(err) {
      assert.ifError(err, 'creates a parseable mbtiles file');
      callback();
    });
  }
}
