'use strict';

var http = require( 'http' );

var port = 1337;

var server = http.createServer( function( req, res ) {
	res.writeHead( 200, { 'Content-Type': 'text/plain' } );
	res.end( 'Hello World\n' );
});

// checking args array expected( ['param-1', 'param-2'] )
var args = process.argv.slice( 2 );

if( args[ 0 ] === 'param-1' && args[ 1 ] === 'param-2' ) {
	return server.listen( port, function() {
		process.send( 'server listening' );
	});
}

throw new Error( 'Checking args failed.' );
