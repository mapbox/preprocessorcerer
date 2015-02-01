#!/usr/bin/env node

var preprocessorcerize = require('..'),
    path = require('path'),
    args = process.argv.slice(2),
    infile = args.shift();

if (!infile) {
  console.error('Usage:');
  console.error('preform-preprocessorcery <input file>');
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
