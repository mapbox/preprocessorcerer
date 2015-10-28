var path = require('path');
var fs = require('fs');
var spawn = require('child_process').spawn;
var mapnik = require('mapnik');
var mapnik_index = path.resolve(mapnik.module_path, 'mapnik-index');
var mkdirp = require('mkdirp');

module.exports = function(infile, outfile, callback) {
  function copy(finished) {
    fs.createReadStream(infile)
      .pipe(fs.createWriteStream(outfile))
      .on('finish', finished);
  }

  mkdirp(outfile, function(err) {
    if (err) return callback(err);
    var outname = path.join(outfile, path.basename(infile));

    copy(function() {
      spawn(mapnik_index, [outname])
        .once('error', callback)
        .on('exit', callback);
    });
  });
};

module.exports.description = 'Add a spatial index to GeoJSON or CSV';

module.exports.criteria = function(infile, info, callback) {
  if (info.filetype !== 'geojson' && info.filetype !== 'csv') {
    return callback(null, false);
  }
  // check size is warrants creating an index
  if (info.size > 50 * 1024 * 1024) { // 50Mb
    return callback(null, true);
  }
  return callback(null, false);
};
