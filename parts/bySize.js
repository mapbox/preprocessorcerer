module.exports = function splitBySize(filepath, info, callback) {
  var max = 50;
  var mb = info.size / 1024 / 1024;
  var pretiled = ['serialtiles', 'tilejson', 'mbtiles'];
  var untiled = ['zip', 'gpx', 'kml', 'geojson', 'csv'];
  var raster = ['tif'];

  if (pretiled.indexOf(info.filetype) !== -1) {
    callback(null, Math.min(max, Math.ceil(mb / 100)));
  } else if (untiled.indexOf(info.filetype) !== -1) {
    callback(null, Math.min(max, Math.ceil(mb / 10)));
  } else if (raster.indexOf(info.filetype) !== -1) {
    callback(null, 1);
  } else {
    callback(null, 1);
  }
};
