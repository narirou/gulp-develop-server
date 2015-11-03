(function() {
  var gutil, http, port, server;

  http = require('http');

  gutil = require('gulp-util');

  port = 3000;

  server = http.createServer(function(req, res) {
    res.writeHead(200, {
      'Content-Type': 'text/html'
    });
    return res.end('<!doctype html><html><head></head><body>Hello World.</body></html>');
  });

  server.listen(port, function() {
    var message;
    process.send('server listening');
    message = gutil.colors.blue('server listening');
    return console.log(message);
  });

}).call(this);
