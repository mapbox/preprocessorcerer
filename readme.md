# Preprocessorcerer

[wip] Makes magical adjustments to geospatial files

## Usage

```sh
> perform-preprocessorcery /some/folder/file.tif
# {"outfile":"/some/folder/eddd5fb92364d75d","parts":1,"descriptions":["Reproject TIFF file to EPSG:3857"]}
```

## Potential Preprocessorcery

This table lists the various preprocessing steps that a file might undergo. These steps are written in the `preprocessors` folder, each file representing a distinct preprocessing step. Each preprocessor exposes a `criteria` function that determines whether or not it should act on the incoming file.

preprocessor | criteria | description
--- | --- | ---
tif-reproject | TIF file that is not in EPSG:3857 | Reproject TIFF file to EPSG:3857
