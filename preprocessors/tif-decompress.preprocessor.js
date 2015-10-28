var gdal = require('gdal');

module.exports = function(infile, outfile, callback) {
  var ds;
  var dscopy;
  var driver = gdal.drivers.get('GTiff');
  outfile = outfile + '.tif';

  try { ds = gdal.open(infile); }
  catch (err) { return callback(err); }

  var options = [
    'TILED=YES',
    'BLOCKXSIZE=512',
    'BLOCKYSIZE=512',
    'COMPRESS=NONE'
  ];

  try { dscopy = driver.createCopy(outfile, ds, options); }
  catch (err) { return callback(err); }
  
  try {
  	ds.close();
  	dscopy.close();
  } catch (err) { return callback(err); }

  callback();
};

module.exports.description = 'Decompress TIFF file';

module.exports.criteria = function(filepath, info, callback) {
  if (info.filetype !== 'tif') return callback(null, false);
  
  var ds;
   
  try { ds = gdal.open(filepath); }
  catch (err) { return callback(err); }

  if (typeof ds.getMetadata('IMAGE_STRUCTURE')['COMPRESSION'] !== "undefined") {
    callback(null, true);
  } else callback(null, false);
}