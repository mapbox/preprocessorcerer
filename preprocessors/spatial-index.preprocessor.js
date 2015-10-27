var path = require('path');
var fs = require('fs');
var spawn = require('child_process').spawn;
var mapnik = require('mapnik');
var mapnik_index = path.resolve(mapnik.module_path, 'mapnik-index');
var queue = require('queue-async');
//var mkdirp = require('mkdirp');

module.exports = function(infile, outfile, callback) {
    // TODO
    console.error(infile);
    console.error(mapnik_index);
    console.error(typeof infile);

    spawn(mapnik_index,[ infile ])
	.once('error', callback)
	.on('exit', callback);
};

module.exports.description = 'Add a spatial index to GeoJSON or CSV';

module.exports.criteria = function(infile, info, callback) {
    if (info.filetype !== 'geojson' && info.filetype !== 'csv') return callback(null, false);
    callback(null, true);
};
