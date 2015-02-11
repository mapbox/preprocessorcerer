var bySize = require('./bySize');
var mbtilesByTiles = require('./mbtiles-byTiles');

// `info` is expected to be an fs.Stat object + .filetype determined by mapbox-file-sniff
module.exports = function(filepath, info, callback) {
  // Define exclusive conditions that define how to cut a particular file into parts

  if (info.filetype === 'mbtiles') {
    mbtilesByTiles(filepath, info, callback);
  } else {
    // Default to cutting based on filesize
    bySize(filepath, info, callback);
  }
};
