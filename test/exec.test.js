var test = require('tape');
var path = require('path');
var os = require('os');
var crypto = require('crypto');
var exec = require('child_process').exec;
var preprocess_exec = path.resolve(__dirname, '..', 'bin', 'perform-preprocessorcery.js');
process.env.PATH = [path.resolve(__dirname, '..', 'bin'), process.env.PATH].join(':');

test('[exec] preprocesses', function(t) {
  var infile = path.resolve(__dirname, 'fixtures', 'wgs84.tif');
  var tmpfile = path.join(os.tmpdir(), crypto.randomBytes(12).toString('hex'));
  var cmd = [preprocess_exec, infile, tmpfile].join(' ');
  exec(cmd, function(err) {
    t.ifError(err, 'no error');
    t.end();
  });
});

test('[exec] fails corrupt TIFF', function(t) {
  var infile = path.resolve(__dirname, 'fixtures', 'corrupt.tif');
  var tmpfile = path.join(os.tmpdir(), crypto.randomBytes(12).toString('hex'));
  var cmd = [preprocess_exec, infile, tmpfile].join(' ');
  exec(cmd, function(err, stderr) {
    t.equal(err.code, 3, 'exit 3');
    t.ok(/corrupt/i.test(stderr), 'expected message');
    t.end();
  });
});
