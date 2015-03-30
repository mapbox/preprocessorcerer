var gdal = require('gdal');
var fs = require('fs');

module.exports = function(infile, outfile, callback) {
  function copy(finished) {
    fs.createReadStream(infile)
      .pipe(fs.createWriteStream(outfile))
      .on('finish', finished);
  }

  copy(function() {
    var ds;
    try { ds = gdal.open(outfile, 'r+'); }
    catch (err) { return copy(callback); }

    try { ds.buildOverviews('CUBIC', [2, 4, 8, 16, 32, 64, 128, 256, 512, 1024]); }
    catch (err) { return copy(callback); }

    callback();
  });
};

module.exports.description = 'Generate overviews for TIFF files';

module.exports.criteria = function(filepath, info, callback) {
  if (info.filetype !== 'tif') return callback(null, false);

  var ds;
  try { ds = gdal.open(filepath, 'r+'); }
  catch (err) { return callback(err); }

  callback(null, true);
};
