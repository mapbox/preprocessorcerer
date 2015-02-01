module.exports = function splitBySize(filepath, info, callback) {
  var max = 50,
      mb = info.size / 1024 / 1024,
      pretiled = ['serialtiles', 'tilejson', 'mbtiles'],
      untiled = ['zip', 'gpx', 'kml', 'geojson', 'csv', 'tif'];

  if (pretiled.indexOf(info.filetype) !== -1) {
    callback(null, Math.min(max, Math.ceil(mb / 100)));
  } else if (untiled.indexOf(info.filetype) !== -1) {
    callback(null, Math.min(max, Math.ceil(mb / 10)));
  } else {
    callback(null, 1);
  }
};
