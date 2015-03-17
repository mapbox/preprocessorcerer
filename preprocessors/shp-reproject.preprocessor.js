var srs = require('srs');
var wmshp = require('wmshp');
var gdal = require('gdal');

module.exports = function(infile, outfile, callback) {
  wmshp(infile, outfile, callback);
};

module.exports.description = 'Reproject shapefile to EPSG:3857';

module.exports.criteria = function(infile, info, callback) {
  if (info.filetype !== 'shp') return callback(null, false);

  var sm = gdal.SpatialReference.fromEPSG(3857);
  var ds;
  var layer;
  var projection;

  try {
    ds = gdal.open(infile);
    layer = ds.layers.get(0);
  }
  catch (err) { return callback(err); }

  sm = srs.parse(sm.toProj4());
  projection = srs.parse(layer.srs.toWKT());

  if (sm !== projection) return callback(null, true);
  callback(null, false);
};
