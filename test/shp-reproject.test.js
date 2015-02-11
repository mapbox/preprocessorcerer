var test = require('tape');
var path = require('path');
var os = require('os');
var crypto = require('crypto');
var gdal = require('gdal');
var reproject = require('../preprocessors/shp-reproject.preprocessor');

function truncate(num) {
  return Math.floor(num * Math.pow(10, 6)) / Math.pow(10, 6);
}

test('[shp-reproject] criteria: not a shapefile', function(assert) {
  var fixture = path.join(__dirname, 'fixtures', 'wgs84.tif');
  reproject.criteria(fixture, { filetype: 'tif' }, function(err, process) {
    assert.ifError(err, 'no error');
    assert.notOk(process, 'do not process');
    assert.end();
  });
});

test('[shp-reproject] criteria: not in epsg:3857', function(assert) {
  var fixture = path.join(__dirname, 'fixtures', 'wgs84.shapefile', 'wgs84.shp');
  reproject.criteria(fixture, { filetype: 'shp' }, function(err, process) {
    assert.ifError(err, 'no error (by file)');
    assert.ok(process, 'do process (by file)');

    reproject.criteria(path.dirname(fixture), { filetype: 'shp' }, function(err, process) {
      assert.ifError(err, 'no error (by folder)');
      assert.ok(process, 'do process (by folder)');
      assert.end();
    });
  });
});

test('[shp-reproject] criteria: in epsg:3857', function(assert) {
  var fixture = path.join(__dirname, 'fixtures', 'sm.shapefile', 'sm.shp');
  reproject.criteria(fixture, { filetype: 'shp' }, function(err, process) {
    assert.ifError(err, 'no error (by file)');
    assert.notOk(process, 'do not process (by file)');

    reproject.criteria(path.dirname(fixture), { filetype: 'shp' }, function(err, process) {
      assert.ifError(err, 'no error (by folder)');
      assert.notOk(process, 'do not process (by folder)');
      assert.end();
    });
  });
});

test('[shp-reproject] reprojects', function(assert) {
  var outfile = path.join(os.tmpdir(), crypto.randomBytes(8).toString('hex') + '.shp');
  var infile = path.join(__dirname, 'fixtures', 'wgs84.shapefile', 'wgs84.shp');

  reproject(infile, outfile, function(err) {
    assert.ifError(err, 'no error');
    var ds = gdal.open(outfile);
    var sm = gdal.SpatialReference.fromEPSG(3857);
    var i = 0;
    var expectedGeom = {
      type: 'MultiPolygon',
      coordinates: [
        [
          [
            [-6866928.470493725501001, 1936250.700885409722105],
            [-6889254.039650277234614, 1945721.30792881315574],
            [-6878926.596530904062092, 1952525.806653905194253],
            [-6866928.470493725501001, 1936250.700885409722105]
          ]
        ],
        [
          [
            [-6871659.994130388833582, 2004785.506589464843273],
            [-6885450.920566814951599, 2001782.969531796174124],
            [-6887677.755660644732416, 2015984.397128761047497],
            [-6871659.994130388833582, 2004785.506589464843273]
          ]
        ]
      ]
    };

    expectedGeom.coordinates = expectedGeom.coordinates.map(function(polygon) {
      return polygon.map(function(ring) {
        return ring.map(function(point) {
          return point.map(truncate);
        });
      });
    });

    ds.layers.forEach(function(layer) {
      if (i > 0) assert.fail('should have only one layer');
      i++;

      assert.ok(layer.srs.isSame(sm), 'reprojected');
      assert.equal(layer.features.count(), 245, 'reprojected all features');

      var feature = layer.features.get(0);
      var geojson = JSON.parse(feature.getGeometry().toJSON());

      geojson.coordinates = geojson.coordinates.map(function(polygon) {
        return polygon.map(function(ring) {
          return ring.map(function(point) {
            return point.map(truncate);
          });
        });
      });

      assert.deepEqual(geojson, expectedGeom, 'checked feature has proper coordinates');
    });

    assert.end();
  });
});
