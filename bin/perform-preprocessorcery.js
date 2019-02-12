#!/usr/bin/env node
'use strict';

const preprocessorcerize = require('..');
const path = require('path');
const args = process.argv.slice(2);
const infile = args.shift();

if (!infile) {
  console.error('Usage:');
  console.error('preform-preprocessorcery <input file>');
  process.exit(1);
}

preprocessorcerize(path.resolve(infile), (err, valid, message, outfile, parts, descriptions) => {
  if (err) {
    console.error(err);
    process.exit(1);
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
