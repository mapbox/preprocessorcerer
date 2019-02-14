'use strict';
const gdal = require('gdal');
const fs = require('fs');
const mkdirp = require('mkdirp');
const queue = require('queue-async');
const spawn = require('child_process').spawn;
const path = require('path');
const digest = require('@mapbox/mapnik-omnivore').digest;
const mapnik = require('mapnik');
const invalid = require('../lib/invalid');
const mapnik_index = mapnik.settings.paths.mapnik_index;
if (!fs.existsSync(mapnik_index)) {
  throw new Error('mapnik-index does not exist at ' + mapnik_index);
}

// disable in production
// gdal.verbose();

module.exports = function(infile, outdirectory, callback) {
  mkdirp(outdirectory, (err) => {
    if (err) return callback(err);

    const geojson_files = [];
    let ds_gpx;
    let full_feature_cnt = 0;
    const wgs84 = gdal.SpatialReference.fromEPSG(4326);

    try {
      ds_gpx = gdal.open(infile);
    }
    catch (err) {
      return callback(new Error(err));
    }

    ds_gpx.layers.forEach((lyr_gpx) => {
      // drop point layers as they can get really huge
      if (lyr_gpx.name === 'track_points' || lyr_gpx.name === 'route_points') {
        return;
      }

      const feat_cnt = lyr_gpx.features.count(true);
      if (feat_cnt === 0) {
        return;
      }

      let geojson;
      let lyr_name;
      let out_ds;
      let out_name;

      try {
        lyr_name = lyr_gpx.name;
        out_name = path.join(outdirectory, lyr_name + '.geojson');
        out_ds = gdal.open(out_name, 'w', 'GeoJSON');
        geojson = out_ds.layers.create(lyr_name, wgs84, lyr_gpx.geomType);
      }
      catch (err) {
        return callback(new Error(err));
      }

      lyr_gpx.features.forEach((gpx_feat) => {
        // skip null or empty geometries
        const geom = gpx_feat.getGeometry();
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

      // release objects to be able to index
      geojson = null;
      out_ds = null;

      geojson_files.push(out_name);
    });

    ds_gpx.close();
    if (full_feature_cnt === 0) {
      return callback(invalid('GPX does not contain any valid features.'));
    }

    // Create metadata file for original gpx source
    const metadatafile = path.join(outdirectory, '/metadata.json');
    digest(infile, (err, metadata) => {
      fs.writeFile(metadatafile, JSON.stringify(metadata), (err) => {
        if (err) throw err;
        createIndices((err) => {
          if (err) throw err;
          archiveOriginal((err) => {
            if (err) throw err;
            return callback();
          });
        });
      });
    });

    function archiveOriginal(callback) {
      const archivedOriginal = path.join(outdirectory, '/archived.gpx');
      const infileContents = fs.readFileSync(infile);
      fs.writeFile(archivedOriginal, infileContents, (err) => {
        if (err) return callback(err);
        return callback();
      });
    }

    // create mapnik index for each geojson layer
    function createIndices(callback) {
      const q = queue();
      geojson_files.forEach((gj) => {
        q.defer(createIndex, gj);
      });

      q.awaitAll((err) => {
        if (err) return callback(err);
        return callback();
      });
    }

    function createIndex(layerfile, callback) {
      // Finally, create an .index file in the output dir (if layer is greater than index_worthy_size).
      // mapnik-index will automatically add ".index" to the end of the original filename
      fs.stat(layerfile, (err, stats) => {
        if (err) return callback(err);

        // check size is warrants creating an index
        if (stats.size >= module.exports.index_worthy_size) {
          let data = '';
          const p = spawn(mapnik_index, [layerfile, '--validate-features'])
            .once('error', callback)
            .on('exit', () => {
              // If error printed to --validate-features log
              if (data.indexOf('Error') !== -1) {
                return callback(data);
              }
              else return callback();
            });

          p.stderr.on('data', (d) => {
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
