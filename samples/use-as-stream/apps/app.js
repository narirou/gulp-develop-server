(function() {
  var http, port, server;

  http = require('http');

  port = 3000;

  server = http.createServer(function(req, res) {
    res.writeHead(200, {
      'Content-Type': 'text/html'
    });
    return res.end('<!doctype html><html><head></head><body>Hello World.</body></html>');
  });

  server.listen(port, function() {
    return process.send('server listening');
  });

}).call(this);
