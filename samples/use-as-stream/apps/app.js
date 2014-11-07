(function() {
  var http, port, server;

  http = require('http');

  port = 3000;

  server = http.createServer(function(req, res) {
    res.writeHead(200, {
      'Content-Type': 'text/plain'
    });
    return res.end('Hello World\n');
  });

  server.listen(port, function() {
    return process.send('server listening');
  });

}).call(this);
