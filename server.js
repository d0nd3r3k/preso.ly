var forever = require('forever'),
    child = new(forever.Monitor)('app.js', {
        'silent': false,
        'pidFile': 'pids/app.pid',
        'watch': true,
        'watchDirectory': '.',      // Top-level directory to watch from.
        'watchIgnoreDotFiles': true, // whether to ignore dot files
        'watchIgnorePatterns': [], // array of glob patterns to ignore, merged with contents of watchDirectory + '/.foreverignore' file
        'logFile': 'logs/forever.log', // Path to log output from forever process (when daemonized)
        'outFile': 'logs/forever.out', // Path to log output from child stdout
        'errFile': 'logs/forever.err'
    });
child.start();
forever.startServer(child);

var http = require('http'),
    httpProxy = require('http-proxy');

//
// Just set up your options...
//
var options = {
  hostnameOnly: true,
  router: {
    'preso.ly': '127.0.0.1:8080'
  }
}

//
// ...and then pass them in when you create your proxy.
//
var proxyServer = httpProxy.createServer(options).listen(80);