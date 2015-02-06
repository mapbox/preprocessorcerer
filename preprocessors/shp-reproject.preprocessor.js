var wmshp = require('wmshp'),
    gdal = require('gdal');

module.exports = function(infile, outfile, callback) {
  wmshp(infile, outfile, callback);
};

module.exports.description = 'Reproject shapefile to EPSG:3857';

module.exports.criteria = function(infile, info, callback) {
  if (info.filetype !== 'shp') return callback(null, false);

  var sm = gdal.SpatialReference.fromEPSG(3857),
      ds, layer;

  try {
    ds = gdal.open(infile);
    layer = ds.layers.get(0);
  }
  catch (err) { return callback(err); }

  if (!layer.srs.isSame(sm)) return callback(null, true);
  callback(null, false);
};
