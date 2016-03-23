var gdal = require('gdal');
var fs = require('fs');
var mkdirp = require('mkdirp');
var queue = require('queue-async');
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

    var geojson_files = [];
    var ds_gpx;
    var full_feature_cnt = 0;
    var wgs84 = gdal.SpatialReference.fromEPSG(4326);

    try {
      ds_gpx = gdal.open(infile);
    }
    catch (err) {
      return callback(new Error(err));
    }

    ds_gpx.layers.forEach(function(lyr_gpx) {
      //drop point layers as they can get really huge
      if (lyr_gpx.name === 'track_points' || lyr_gpx.name === 'route_points') {
        return;
      }

      var feat_cnt = lyr_gpx.features.count(true);
      if (feat_cnt === 0) {
        return;
      }

      var geojson;
      var lyr_name;
      var out_ds;
      var out_name;

      try {
        lyr_name = lyr_gpx.name;
        out_name = path.join(outdirectory, lyr_name + '.geojson');
        out_ds = gdal.open(out_name, 'w', 'GeoJSON');
        geojson = out_ds.layers.create(lyr_name, wgs84, lyr_gpx.geomType);
      }
      catch (err) {
        return callback(new Error(err));
      }

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
      });

      geojson.flush();
      out_ds.flush();
      out_ds.close();

      //release objects to be able to index
      geojson = null;
      out_ds = null;

      geojson_files.push(out_name);
    });

    ds_gpx.close();
    if (full_feature_cnt === 0) {
      return callback(new Error('GPX does not contain any valid features.'));
    }

    // Create metadata file for original gpx source
    var metadatafile = path.join(outdirectory, '/metadata.json');
    digest(infile, function(err, metadata) {
      if (err) return callback(err);
      fs.writeFile(metadatafile, JSON.stringify(metadata), function(err) {
        if (err) return callback(err);
        return createIndices(callback);
      });
    });

    function createIndices(callback) {
      // create mapnik index for each geojson layer
      var q = queue();
      geojson_files.forEach(function(gj) {
        q.defer(createIndex, gj);
      });

      q.awaitAll(function(err) {
        if (err) return callback(err);
        return callback();
      });
    }

    function createIndex(layerfile, callback) {
      // Finally, create an .index file in the output dir (if layer is greater than index_worthy_size).
      // mapnik-index will automatically add ".index" to the end of the original filename
      fs.stat(layerfile, function(err, stats) {
        if (err) return callback(err);

        // check size is warrants creating an index
        if (stats.size >= module.exports.index_worthy_size) {
          var data = '';
          var p = spawn(mapnik_index, [layerfile, '--validate-features'])
            .once('error', callback)
            .on('exit', function() {
              // If error printed to --validate-features log
              if (data.indexOf('Error') != -1) {
                return callback(data);
              }
              else return callback();
            });

          p.stderr.on('data', function(d) {
            d.toString();
            data += d;
          });
        } else {
          return callback();
        }
      });
    }
  });
};

module.exports.description = 'Convert GPX to GeoJSON';
module.exports.index_worthy_size = 10 * 1024 * 1024; // 10 MB

module.exports.criteria = function(filepath, info, callback) {

  if (info.filetype !== 'gpx') return callback(null, false);

  callback(null, true);
};
