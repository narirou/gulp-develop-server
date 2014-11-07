'use strict';

var http = require( 'http' );

var port = 3000;

var server = http.createServer( function( req, res ) {
	res.writeHead( 200, { 'Content-Type': 'text/plain' } );
	res.end( 'Hello World\n' );
});

server.listen( port, function() {
	process.send( 'server listening' );
});
