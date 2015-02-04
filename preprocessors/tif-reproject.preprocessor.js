var gdal = require('gdal'),
    srs = require('srs'),
    wmtiff = require('wmtiff').reproject;

module.exports = wmtiff;

module.exports.description = 'Reproject TIFF file to EPSG:3857';

module.exports.criteria = function(filepath, info, callback) {
  if (info.filetype !== 'tif') return callback(null, false);

  var sm = gdal.SpatialReference.fromEPSG(3857),
      ds, projection;

  try { ds = gdal.open(filepath); }
  catch (err) { return callback(err); }

  try {
    sm = srs.parse(sm.toProj4());
    projection = srs.parse(ds.srs.toProj4());
  }
  catch (err) { return callback(err); }

  if (projection === sm) callback(null, false);
  else callback(null, true);
};
