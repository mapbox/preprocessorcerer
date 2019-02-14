'use strict';
const bySize = require('./bySize');
const mbtilesByTiles = require('./mbtiles-byTiles');
const serialtilesByTiles = require('./serialtiles-byTiles');

// `info` is expected to be an fs.Stat object + .filetype determined by mapbox-file-sniff
module.exports = function(filepath, info, callback) {
  // Define exclusive conditions that define how to cut a particular file into parts

  if (info.filetype === 'mbtiles') mbtilesByTiles(filepath, info, callback);
  else if (info.filetype === 'serialtiles') serialtilesByTiles(filepath, info, callback);

  // Default to cutting based on filesize
  else bySize(filepath, info, callback);
};
