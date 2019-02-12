'use strict';
module.exports = function splitBySize(filepath, info, callback) {
  const max = 50;
  const mb = info.size / 1024 / 1024;
  const pretiled = ['serialtiles', 'tilejson', 'mbtiles'];
  const untiled = ['zip', 'gpx', 'kml', 'geojson', 'csv'];
  const raster = ['tif'];

  if (pretiled.indexOf(info.filetype) !== -1) {
    callback(null, Math.min(max, Math.ceil(mb / 100)));
  } else if (untiled.indexOf(info.filetype) !== -1) {
    callback(null, Math.min(max, Math.ceil(mb / 10)));
  } else if (raster.indexOf(info.filetype) !== -1) {
    callback(null, Math.min(max, Math.ceil(mb / 1500)));
  } else {
    callback(null, 1);
  }
};
