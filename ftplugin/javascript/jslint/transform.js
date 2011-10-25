/*jslint laxbreak: true */

if (typeof require != 'undefined') {
    print = require('sys').puts;
}

// Import extra libraries if running in Rhino.
if (typeof importPackage != 'undefined') {
    importPackage(java.io);
    importPackage(java.lang);
}

var readSTDIN = (function() {
    // readSTDIN() definition for nodejs
    if (typeof process != 'undefined' && process.openStdin) {
        return function readSTDIN(callback) {
            var stdin = process.openStdin()
              , body = [];

            stdin.on('data', function(chunk) {
                body.push(chunk);
            });

            stdin.on('end', function(chunk) {
                callback(body.join('\n'));
            });
        };

    // readSTDIN() definition for Rhino
    } else if (typeof BufferedReader != 'undefined') {
        return function readSTDIN(callback) {
            // setup the input buffer and output buffer
            var stdin = new BufferedReader(new InputStreamReader(System['in'])),
                lines = [];

            // read stdin buffer until EOF (or skip)
            while (stdin.ready()){
                lines.push(stdin.readLine());
            }

            callback(lines.join('\n'));
        };

    // readSTDIN() definition for Spidermonkey
    } else if (typeof readline != 'undefined') {
        return function readSTDIN(callback) {
            var line
              , input = []
              , emptyCount = 0
              , i;

            line = readline();
            while (emptyCount < 25) {
                input.push(line);
                if (line) {
                    emptyCount = 0;
                } else {
                    emptyCount += 1;
                }
                line = readline();
            }

            input.splice(-emptyCount);
            callback(input.join('\n'));
        };
    }
})();

readSTDIN(function(body) {
  var config, globals, glob, conf, c, i;
  var comment_matcher = /\/\/.*/g;

  body = body.replace(comment_matcher, '');     // Strip single-line comments from .jslintrc contents
  config = JSON.parse(body);
  globals = config.predef;
  i = globals.length;

  conf = '/*jshint ';

  for (c in config) {
    if (config.hasOwnProperty(c)) {
      if (c === 'predef') continue;
      conf += c + ':' + config[c] + ',';
    }
  }

  conf += "*/";
  glob = "/*global ";

  while (i--) {
    glob += globals[i] + ': false,';
  }
  glob += "*/";

  conf += glob;

  print(conf);
});

