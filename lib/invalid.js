'use strict';
const os = require('os');
const path = require('path');
const util = require('util');

module.exports = function invalid(err) {
  let msg = typeof err === 'string' ?
    util.format.apply(this, arguments) : err.message;

  msg = msg
    .replace(new RegExp(path.join(os.tmpdir(),'[0-9a-z]+-'), 'g'), '');

  const error = new Error(msg);
  error.code = 'EINVALID';
  if (err.stack) error.stack = err.stack;
  return error;
};
