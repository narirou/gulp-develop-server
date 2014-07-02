'use strict';

var express = require( 'express' );

var app = express();

app.get( '/', function(req, res){
	res.status( 200 );
	res.send( 'Hello World' );
});

app.listen( 1337, function() {
	process.send( 'server listening' );
});
