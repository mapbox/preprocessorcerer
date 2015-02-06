var path = require('path'),
    fs = require('fs'),
    spawn = require('child_process').spawn,
    shapeindex = path.resolve(__dirname, '..', 'node_modules', '.bin', 'mapnik-shapeindex.js');

module.exports = function(infile, outfile, callback) {
  spawn(process.execPath, [shapeindex, '--shape_files', infile])
    .once('error', function(err) {
      callback(err);
    })
    .on('exit', function() {
      callback();
    });
};

module.exports.description = 'Add a spatial index to shapefile';

module.exports.criteria = function(infile, info, callback) {
  if (info.filetype !== 'shp') return callback(null, false);

  var ext = path.extname(infile),
      dir = ext === '.shp' ? path.dirname(infile) : infile,
      name = ext === '.shp' ? path.basename(infile, '.shp') : '';

  fs.readdir(dir, function(err, files) {
    if (err) return callback(err);

    var shp, re;

    if (!name) {
      shp = files.filter(function(filename) {
        return path.extname(filename) === '.shp';
      });

      if (!shp.length) return callback(new Error('Could not locate shapefile'));
      name = path.basename(shp[0], '.shp');
    }

    re = new RegExp('^' + name);

    files = files.filter(function(filename) {
      var ext = path.extname(filename);
      return re.test(filename) && ext === '.index';
    });

    if (files.length) return callback(null, false);
    callback(null, true);
  });
};
