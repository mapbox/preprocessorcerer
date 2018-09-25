var gdal = require('gdal');

module.exports = function(infile, outfile, callback) {
  var err = new Error('Corrupt TIFF file');
  err.code = 'EINVALID';
  callback(err);
};

module.exports.description = 'TIFF file is corrupt';

module.exports.criteria = function(filepath, info, callback) {
  if (info.filetype !== 'tif') return callback(null, false);
  checkCorrupt(filepath, function(err, corrupt) {
    if (err) return callback(err);
    if (corrupt) return callback(null, true);
    else return callback(null, false);
  });
};

function checkCorrupt(filepath, callback) {
  var ds;
  try { ds = gdal.open(filepath); }
  catch (err) { return callback(err); }

  var bands = ds.bands.count();

  for (var i = 1; i <= bands; i++) {
    var check_sum = gdal.checksumImage(ds.bands.get(i));
    if (check_sum === 0 || gdal.lastError) return callback(null, true);
    else return callback(null, false);
  }
}
