var bySize = require('./bySize');

// `info` is expected to be an fs.Stat object + .filetype determined by mapbox-file-sniff
module.exports = function(filepath, info, callback) {
  // Define exclusive conditions that define how to cut a particular file into parts
  var byNumTilesCondition = false;

  if (byNumTilesCondition) {
    callback(new Error('Not Implemented'));
  } else {
    // Default to cutting based on filesize
    bySize(filepath, info, callback);
  }
};
