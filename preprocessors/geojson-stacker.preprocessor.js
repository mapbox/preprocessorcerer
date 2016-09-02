var fs = require('fs');
var stackerOfWorlds = require('stacker-of-worlds');
var geojsonhint = require('geojsonhint');

module.exports = function(infile, outfile, callback) {
  fs.readFile(infile, 'utf8', function(err, data) {
    if (err) return callback(err);
    var stacked = stackerOfWorlds.stack(JSON.parse(data));
    fs.writeFile(outfile, JSON.stringify(stacked), callback);
  });
};

module.exports.description = 'Move all longitudes into the +/-180 range';

module.exports.criteria = function(infile, info, callback) {
  if (info.filetype !== 'geojson') return callback(null, false);

  fs.readFile(infile, 'utf8', function(err, data) {
    var errors = geojsonhint.hint(data).filter(function(lintError) {
      return lintError.level !== 'message';
    });

    if (errors.length > 0) return callback(null, false);
    callback(null, true);
  });
};
