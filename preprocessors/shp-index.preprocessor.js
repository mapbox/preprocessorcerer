'use strict';
const path = require('path');
const fs = require('fs');
const spawn = require('child_process').spawn;
const mapnik = require('mapnik');
const invalid = require('../lib/invalid');
const shapeindex = mapnik.settings.paths.shape_index;
if (!fs.existsSync(shapeindex)) {
  throw new Error('shapeindex does not exist at ' + shapeindex);
}

const queue = require('queue-async');
const mkdirp = require('mkdirp');

module.exports = function(infile, outfile, callback) {
  // Determine whether we've been fed a folder containing a shapefile or a .shp
  const inExt = path.extname(infile);
  const inDir = inExt === '.shp' ? path.dirname(infile) : infile;
  let inName = inExt === '.shp' ? path.basename(infile, '.shp') : '';

  // Read the input directory to find files related to the shapefile
  fs.readdir(inDir, (err, files) => {
    if (err) return callback(err);

    // If we were given an input folder, find the name of the input .shp
    if (!inName) {
      const shp = files.filter((filename) => {
        return path.extname(filename) === '.shp';
      });

      if (!shp.length) return callback(invalid('Could not locate shapefile'));
      inName = path.basename(shp[0], '.shp');
    }

    // Determine the output file names and paths. We may have received a folder or .shp name
    const outExt = path.extname(outfile);
    const outDir = outExt === '.shp' ? path.dirname(outfile) : outfile;
    const outName = outExt === '.shp' ? path.basename(outfile, '.shp') : inName;
    const outPath = path.join(outDir, outName);

    mkdirp(outDir, (err) => {
      if (err) return callback(err);

      // Loop through files in the input dir, copy each .shp-related one to output dir
      // Ignore already-existing index files
      const q = queue();
      files.forEach((filename) => {
        const ext = path.extname(filename);
        if (path.basename(filename, ext) === inName && ext !== '.index') {
          q.defer((next) => {
            fs.createReadStream(path.join(inDir, filename))
              .once('error', next)
              .pipe(fs.createWriteStream(path.join(outDir, outName + ext)))
              .once('error', next)
              .on('finish', next);
          });
        }
      });

      q.awaitAll((err) => {
        if (err) return callback(err);

        // Finally, create an .index file in the output dir
        spawn(shapeindex,
          ['--shape_files', outPath + '.shp', '--index-parts'],
          { stdio: 'ignore' })
          .once('error', callback)
          .on('exit', () => {
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
