(function () {
  'use strict';
  var argv = process.argv;
  var path = require('path');
  var exec = require('child_process').exec;
  var waterfall = require('run-waterfall');
  var which = require('which');
  var fs = require('fs')

  try {
    which.sync('git');
  } catch (err) {
    console.warn('\nYou need to install git.\n');
  }

  waterfall([function (callback) {
    if (argv[2]) {
      var filePath = path.resolve(argv[2]);
      fs.readdir(filePath, callback)
    }
  }, function (dirnames, callback) {
    var i = 0;
    var out = [];
    (function sync (i) {
      if (dirnames[i] === void 0) {
        callback(null, out);
        return;
      }
      var filePath = path.resolve(argv[2] + dirnames[i]);
      var command = 'cd ' + filePath + ';';
      command += 'git branch';
      exec(command, function (error, stdout, stderr) {
        if (error !== null) {
          console.error('exec error: ' + error);
          console.error('stderr: ' + stderr);
        } else {
          if (stdout.match(/\* master/)) {
            out.push(dirnames[i]);
          }
        }
        i += 1;
        sync(i);
        return;
      });
    }(i));
  }, function (dirnames, callback) {
    (function sync (i) {
      if (dirnames[i] === void 0) {
        callback(null);
        return;
      }
      var filePath = path.resolve(path.resolve(argv[2]) + '/' + dirnames[i]);
      var command = 'cd ' + filePath + ';';
      console.log((i + 1) + ' / ' + dirnames.length);
      console.log('Path: ' + filePath);
      command += 'git pull origin master';
      exec(command, function (error, stdout, stderr) {
        if (error !== null) {
          console.error('exec error: ' + error);
          console.error('stderr: ' + stderr);
          return;
        } else {
          console.log(stdout);
          i += 1;
          sync(i);
          return;
        }
      });
    }(0));
  }, function () {
    console.log('Done');
  }]);
}());
