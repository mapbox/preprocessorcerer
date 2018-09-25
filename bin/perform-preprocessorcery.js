#!/usr/bin/env node

var preprocessorcerize = require('..');
var path = require('path');
var args = process.argv.slice(2);
var infile = args.shift();

if (!infile) {
  console.error('Usage:');
  console.error('preform-preprocessorcery <input file>');
  process.exit(1);
}

preprocessorcerize(path.resolve(infile), function(err, valid, message, outfile, parts, descriptions) {
  if (err) {
    console.log(err);
    if (err.code === 'EINVALID') process.exit(3);
    else process.exit(1);
  }

  if (!valid) {
    console.error(message);
    process.exit(3);
  }

  console.log(JSON.stringify({
    outfile: outfile,
    parts: parts,
    descriptions: descriptions
  }));
});
