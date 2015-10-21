#!/usr/bin/env node

var preprocessorcerize = require('..');
var path = require('path');
var args = process.argv.slice(2);
var infile = args.shift();

if (!infile) {
  console.error('Usage:');
  console.error('perform-preprocessorcery <input file>');
  process.exit(1);
}

preprocessorcerize(path.resolve(infile), function(err, outfile, parts, descriptions) {
  if (err) {
    console.error(err);
    process.exit(1);
  }

  console.log(JSON.stringify({
    outfile: outfile,
    parts: parts,
    descriptions: descriptions
  }));
});
