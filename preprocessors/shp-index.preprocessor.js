var path = require('path');
var fs = require('fs');
var spawn = require('child_process').spawn;
var mapnik = require('mapnik');
var invalid = require('../lib/invalid');
var shapeindex = mapnik.settings.paths.shape_index;
if (!fs.existsSync(shapeindex)) {
  throw new Error('shapeindex does not exist at ' + shapeindex);
}

var queue = require('queue-async');
var mkdirp = require('mkdirp');

module.exports = function(infile, outfile, callback) {
  // Determine whether we've been fed a folder containing a shapefile or a .shp
  var inExt = path.extname(infile);
  var inDir = inExt === '.shp' ? path.dirname(infile) : infile;
  var inName = inExt === '.shp' ? path.basename(infile, '.shp') : '';

  // Read the input directory to find files related to the shapefile
  fs.readdir(inDir, function(err, files) {
    if (err) return callback(err);

    // If we were given an input folder, find the name of the input .shp
    if (!inName) {
      var shp = files.filter(function(filename) {
        return path.extname(filename) === '.shp';
      });

      if (!shp.length) return callback(invalid('Could not locate shapefile'));
      inName = path.basename(shp[0], '.shp');
    }

    // Determine the output file names and paths. We may have received a folder or .shp name
    var outExt = path.extname(outfile);
    var outDir = outExt === '.shp' ? path.dirname(outfile) : outfile;
    var outName = outExt === '.shp' ? path.basename(outfile, '.shp') : inName;
    var outPath = path.join(outDir, outName);

    mkdirp(outDir, function(err) {
      if (err) return callback(err);

      // Loop through files in the input dir, copy each .shp-related one to output dir
      // Ignore already-existing index files
      var q = queue();
      files.forEach(function(filename) {
        var ext = path.extname(filename);
        if (path.basename(filename, ext) === inName && ext !== '.index') {
          q.defer(function(next) {
            fs.createReadStream(path.join(inDir, filename))
              .once('error', next)
              .pipe(fs.createWriteStream(path.join(outDir, outName + ext)))
              .once('error', next)
              .on('finish', next);
          });
        }
      });

      q.awaitAll(function(err) {
        if (err) return callback(err);

        // Finally, create an .index file in the output dir
        spawn(shapeindex, 
              ['--shape_files', outPath + '.shp', '--index-parts'],
              { stdio: 'ignore'})
          .once('error', callback)
          .on('exit', function() {
            callback();
          });
      });
    });
  });
};

module.exports.description = 'Add a spatial index to shapefile';

module.exports.criteria = function(infile, info, callback) {
  if (info.filetype !== 'shp') return callback(null, false);
  callback(null, true);
};
