# Preprocessorcerer

[![Build Status](https://travis-ci.org/mapbox/preprocessorcerer.svg?branch=master)](https://travis-ci.org/mapbox/preprocessorcerer)
[![codecov](https://codecov.io/gh/mapbox/preprocessorcerer/branch/master/graph/badge.svg)](https://codecov.io/gh/mapbox/preprocessorcerer)

[wip] Makes magical adjustments to geospatial files

## Usage

```sh
perform-preprocessorcery /some/folder/file.tif
# {"outfile":"/some/folder/eddd5fb92364d75d","parts":1,"descriptions":["Reproject TIFF file to EPSG:3857"]}
```

## Potential Preprocessorcery

This table lists the various preprocessing steps that a file might undergo. These steps are written in the `preprocessors` folder, each file representing a distinct preprocessing step. Each preprocessor exposes a `criteria` function that determines whether or not it should act on the incoming file. The order of this list is the order in which preprocessors would be applied to any single file that matches multiple criteria.

preprocessor | criteria | description
--- | --- | ---
tif-toBytes | TIF file with 16-bit pixels | Scale 16-bit TIFF files to 8-bit
tif-reproject | TIF file that is not in EPSG:3857 | Reproject TIFF file to EPSG:3857
tif-overviews | TIF file | Generate overviews for TIFF files
shp-index | Shapefile that has no mapnik index | Add a spatial index to shapefile
geojson-bom | GeoJSON string with a BOM char | Remove a byte-order-mark from a geojson string
spatial-index | GeoJSON or CSV has no mapnik index | Add spatial index (*.index) to GeoJSON or CSV

## Part Splitting

splitter | criteria | description
--- | --- | ---
mbtiles-byTiles | mbtiles file | 100,000 tiles per part, up to 50 parts max
serialtiles-byTiles | serialtiles file | 200,000 tiles per part, up to 50 parts max
default | none of above criteria matched | Split into parts based on file size
