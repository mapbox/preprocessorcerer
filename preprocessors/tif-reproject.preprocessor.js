var omnivore = require('mapnik-omnivore'),
    gdal = require('gdal'),
    wmtiff = require('wmtiff').reproject;

module.exports = wmtiff;

module.exports.description = 'Reproject TIFF file to EPSG:3857';

module.exports.criteria = function(filepath, info, callback) {
  if (info.filetype !== 'tif') return callback(null, false);

  omnivore.digest(filepath, function(err, metadata) {
    if (err) return callback(err);

    var sm = gdal.SpatialReference.fromEPSG(3857),
        ref = gdal.SpatialReference.fromProj4(metadata.projection);

    if (sm.isSame(ref)) callback(null, false);
    else callback(null, true);
  });
};
