# Changelog

## 0.14.0

- Upgrade node-gdal@0.9.3
- Upgrade node-mapnik@3.5.14
- Upgrade mapnik-file-sniff, mapnik-omnivore, node-srs, node-wmtiff, node-wmshp

## 0.13.4

- mapnik-omnivore@8.0.0

## 0.13.3

- Properly handle errors from `spatial-index.js` (using `lib/invalid.js`)

## 0.13.2

- Properly handle expected errors/invalid files (exit 3 instead of exit 1)

## 0.13.1

- Add special character `#` to cleanse [during layer creation](https://github.com/mapbox/preprocessorcerer/commit/0b863be5f4afb51a63280163422db64398667882#diff-6a3ecdd8c5e09b49f32f6a629e0e52d0R65)

## 0.13.0

 - Bundle support: Convert KML and GPX sources into geojson bundles
 - Update mapnik-omnivore to ~7.4.0 (more zoom support)
 - Update dev dependencies (eslint, checksu, rimraf)

## 0.12.0

 - Updated mapnik to 3.5.0

## 0.10.2

 - Packaged without 68 MB test data

## 0.10.1

 - Upgraded other modules that use gdal to use ~0.8.0

## 0.10.0

 - Upgraded to node-gdal@0.8.0 and split@1.0.0
