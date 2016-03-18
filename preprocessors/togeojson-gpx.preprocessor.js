var gdal = require('gdal');
var fs = require('fs');
var mkdirp = require('mkdirp');
var spawn = require('child_process').spawn;
var path = require('path');
var digest = require('mapnik-omnivore').digest;
var mapnik = require('mapnik');
var mapnik_index = path.resolve(mapnik.module_path, 'mapnik-index' + (process.platform === 'win32' ? '.exe' : ''));
if (!fs.existsSync(mapnik_index)) {
  throw new Error('mapnik-index does not exist at ' + mapnik_index);
}

//disable in production
//gdal.verbose();

module.exports = function(infile, outdirectory, callback) {

  mkdirp(outdirectory, function(err) {
    if (err) return callback(err);

    try {
      var wgs84 = gdal.SpatialReference.fromEPSG(4326);
      var ds_gpx = gdal.open(infile);
      var full_feature_cnt = 0;

      ds_gpx.layers.forEach(function(lyr_gpx) {
        //drop point layers as they can get really huge
        if (lyr_gpx.name === 'track_points' || lyr_gpx.name === 'route_points') {
          return;
        }

        var feat_cnt = lyr_gpx.features.count(true);
        if (feat_cnt === 0) {
          return;
        }

        var lyr_name = lyr_gpx.name;
        var out_name = path.join(outdirectory, lyr_name + '.geojson');
        var out_ds = gdal.open(out_name, 'w', 'GeoJSON');
        var geojson = out_ds.layers.create(lyr_name, wgs84, lyr_gpx.geomType);
        lyr_gpx.features.forEach(function(gpx_feat) {
          //skip null or empty geometries
          var geom = gpx_feat.getGeometry();
          if (!geom) {
            return;
          } else {
            if (geom.isEmpty()) {
              return;
            }

            if (!geom.isValid()) {
              return;
            }
          }

          geojson.features.add(gpx_feat);
          full_feature_cnt++;

          // create mapnik index for each geojson layer
          createIndex(out_name, function(err) {
            if (err) return callback(err);
          });
        });

        geojson.flush();
        out_ds.flush();
        out_ds.close();
      });

      ds_gpx.close();
      if (full_feature_cnt === 0) {
        return callback(new Error('GPX does not contain any valid features.'));
      }
    }
    catch (err) {
      return callback(err);
    }

    // Create metadata file for original gpx source
    var metadatafile = path.join(outdirectory, '/metadata.json');
    digest(infile, function(err, metadata) {
      fs.writeFile(metadatafile, JSON.stringify(metadata), function(err) {
        if (err) return callback(err);
        return callback();
      });
    });

    function createIndex(layerfile, callback) {
      // Finally, create an .index file in the output dir
      // mapnik-index will automatically add ".index" to the end of the original filename
      var data = '';
      var p = spawn(mapnik_index, [layerfile, '--validate-features'])
        .once('error', callback)
        .on('exit', function() {
          // If error printed to --validate-features log
          if (data.indexOf('Error') != -1) {
            callback('Invalid geojson feature');
          }
          else callback();
        });

      p.stderr.on('data', function(d) {
        d.toString();
        data += d;
      });
    }
  });
};

module.exports.description = 'Convert GPX to GeoJSON';

module.exports.criteria = function(filepath, info, callback) {

  if (info.filetype !== 'gpx') return callback(null, false);

  callback(null, true);
};
