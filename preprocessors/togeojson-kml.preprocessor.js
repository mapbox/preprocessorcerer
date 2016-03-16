var gdal = require('gdal');
var fs = require('fs');
var mkdirp = require('mkdirp');
var path = require('path');
var util = require('util');
var digest = require('mapnik-omnivore').digest;
var mapnik = require('mapnik');
var spawn = require('child_process').spawn;
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
      var ds_kml = gdal.open(infile);
      var lyr_cnt = ds_kml.layers.count();
      var full_feature_cnt = 0;

      if (lyr_cnt < 1) {
        ds_kml.close();
        return callback(new Error('KML does not contain any layers.'));
      }

      if (lyr_cnt > module.exports.max_layer_count) {
        ds_kml.close();
        return callback(new Error(util.format('%d layers found. Maximum of %d layers allowed.', lyr_cnt, module.exports.max_layer_count)));
      }

      var duplicate_lyr_msg = layername_count(ds_kml);
      if (duplicate_lyr_msg) {
        ds_kml.close();
        return callback(new Error(duplicate_lyr_msg));
      }

      ds_kml.layers.forEach(function(lyr_kml) {
        var feat_cnt = lyr_kml.features.count(true);
        if (feat_cnt === 0) {
          return;
        }

        //strip kml from layer name. features at the root get the KML filename as layer name
        var lyr_name = lyr_kml.name
          .replace(/.kml/gi, '')
          .replace(/[ \\/&?]/g, '_')
          .replace(/[();:,\]\[{}]/g, '');
        var out_name = path.join(outdirectory, lyr_name + '.geojson');
        var out_ds = gdal.open(out_name, 'w', 'GeoJSON');
        var geojson = out_ds.layers.create(lyr_name, wgs84, lyr_kml.geomType);
        lyr_kml.features.forEach(function(kml_feat) {
          var geom = kml_feat.getGeometry();
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

          geojson.features.add(kml_feat);
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

      ds_kml.close();
      if (full_feature_cnt === 0) {
        return callback(new Error('KML does not contain any valid features'));
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
          console.log(data);
          callback(data);
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

module.exports.description = 'Convert KML to GeoJSON';

module.exports.criteria = function(filepath, info, callback) {

  if (info.filetype !== 'kml') return callback(null, false);

  callback(null, true);
};

function layername_count(ds) {
  var lyr_name_cnt = {};
  ds.layers.forEach(function(lyr) {
    var lyr_name = lyr.name;
    if (lyr_name in lyr_name_cnt) {
      lyr_name_cnt[lyr_name]++;
    } else {
      lyr_name_cnt[lyr_name] = 1;
    }
  });

  var err = '';
  for (var name in lyr_name_cnt) {
    var cnt = lyr_name_cnt[name];
    if (cnt > 1) {
      err += util.format('%s[%s] found %d times', err.length > 0 ? ', ' : '', name, cnt);
    }
  }

  return err.length > 0 ? 'Duplicate layer names! ' + err : null;
}

//expose this as ENV option?
module.exports.max_layer_count = 15;
