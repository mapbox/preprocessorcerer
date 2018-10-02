var gdal = require('gdal');
var srs = require('srs');
var wmtiff = require('wmtiff').reproject;

module.exports = function(infile, outfile, callback) {
  try { wmtiff(infile, outfile); }
  catch (err) {
    if (err.message.indexOf('GDAL Reprojection Error') > -1) {
      err.message = 'Unable to reproject data. Please reproject to Web Mercator (EPSG:3857) and try again.';
      err.code = 'EINVALID';
    }

    if (err.message.indexOf('GDAL Bounds Error') > -1) {
      err.message = 'Latitude or longitude bounds values exceed limits of CRS. Please check if the CRS is correct.';
      err.code = 'EINVALID';
    }

    return callback(err);
  }
  callback();
};

module.exports.description = 'Reproject TIFF file to EPSG:3857';

module.exports.criteria = function(filepath, info, callback) {
  if (info.filetype !== 'tif') return callback(null, false);

  var sm = gdal.SpatialReference.fromEPSG(3857);
  var ds;
  var projection;

  try { ds = gdal.open(filepath); }
  catch (err) { return callback(err); }

  // no crs information present
  if (!ds.srs) {
    var err = new Error('Unable to reproject tif. No CRS information found.');
    err.code = 'EINVALID';
    return callback(err);
  }

  try {
    sm = srs.parse(sm.toProj4());
    projection = srs.parse(ds.srs.toWKT());
  } catch (err) {
    return callback(err);
  }

  ds.close();
  ds = null;

  if (projection === sm) callback(null, false);
  else callback(null, true);
};
