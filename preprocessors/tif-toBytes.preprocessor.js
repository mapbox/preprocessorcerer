var gdal = require('gdal'),
    bytetiff = require('bytetiff').scale;

module.exports = function(infile, outfile, callback) {
  bytetiff(infile, outfile, callback);
};

module.exports.description = 'Scale 16-bit TIFF files to 8-bit';

module.exports.criteria = function(filepath, info, callback) {
  var ds, band;

  if (info.filetype !== 'tif') return callback(null, false);

  try { ds = gdal.open(filepath); }
  catch (err) { return callback(err); }

  if (!ds.bands.count()) return callback(null, false);

  try { band = ds.bands.get(1); }
  catch (err) { return callback(err); }

  if (band.dataType === gdal.GDT_UInt16) return callback(null, true);
  callback(null, false);
};
