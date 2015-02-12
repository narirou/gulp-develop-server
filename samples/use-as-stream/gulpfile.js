'use strict';

var gulp   = require( 'gulp' ),
	server = require( '../../../gulp-develop-server' ),
	bs     = require( 'browser-sync' ),
	coffee = require( 'gulp-coffee' );

var options = {
	server: {
		path: './apps/app.js',
		execArgv: [ '--harmony' ]
	},
	bs: {
		proxy: 'http://localhost:3000'
	}
};

var serverCoffeeFiles = [
	'./src/*.coffee'
];

gulp.task( 'server:start', function() {
	server.listen( options.server, function( error ) {
		if( ! error ) bs( options.bs );
	});
});

// If server side's coffee files change, compile these files,
// restart the server and then browser-reload.
gulp.task( 'server:restart', function() {
	gulp.src( serverCoffeeFiles )
		.pipe( coffee() )
		.pipe( gulp.dest( './apps' ) )
		.pipe( server() )
		.pipe( bs.reload({ stream: true }) );
});

gulp.task( 'default', [ 'server:start' ], function() {
	gulp.watch( serverCoffeeFiles, [ 'server:restart' ] );
});
