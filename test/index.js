var fs = require('fs'),
    path = require('path'),
    testFixture = path.resolve(__dirname, 'fixtures', 'test.preprocessor.js'),
    tmpProcessorFile = path.resolve(__dirname, '..', 'preprocessors', 'test.preprocessor.js');

// Adds a temporary test.preprocessor.js before anyone will require('../preprocessors')
fs.createReadStream(testFixture)
  .pipe(fs.createWriteStream(tmpProcessorFile))
  .on('close', function() {

    // Run each *.test.js file
    fs.readdir(__dirname, function(err, files) {
      files.forEach(function(filename) {
        if (/\.test\.js$/.test(filename)) require(path.join(__dirname, filename));
      });
    });

    // Can remove the tmpfile that's already loaded in memory
    fs.unlink(tmpProcessorFile);
  });
