'use strict';

var http = require( 'http' );

var port = 3000;

var server = http.createServer( function( req, res ) {
	res.writeHead( 200, { 'Content-Type': 'text/html' } );
	res.end( '<!doctype html><html><head></head><body>Hello World.</body></html>' );
});

server.listen( port, function() {
	process.send( 'server listening' );
});
