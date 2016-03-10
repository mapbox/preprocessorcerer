var gdal = require('gdal');
var mkdirp = require('mkdirp');
var path = require('path');

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
        var feat_cnt = lyr_gpx.features.count(true);
        if (feat_cnt === 0) {
          return;
        }

        var lyr_name = lyr_gpx.name;
        var out_name = path.join(outdirectory, lyr_name);
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

    callback();
  });
};

module.exports.description = 'Convert GPX to GeoJSON';

module.exports.criteria = function(filepath, info, callback) {

  if (info.filetype !== 'gpx') return callback(null, false);

  callback(null, true);
};
