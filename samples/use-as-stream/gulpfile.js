'use strict';

var gulp       = require( 'gulp' ),
	server     = require( 'gulp-develop-server' ),
	livereload = require( 'gulp-livereload' ),
	coffee     = require( 'gulp-coffee' );

var options = {
	path: './apps/app.js',
	execArgv: [ '--harmony' ]
};

// If server side's coffee files change, compile these files,
// restart the server and then livereload.
gulp.task( 'server:restart', function() {
	gulp.src( './src/*.coffee' )
		.pipe( coffee() )
		.pipe( gulp.dest( './apps' ) )
		.pipe( server() )
		.pipe( livereload() );
});

gulp.task( 'default', function() {
	server.listen( options, livereload.listen );
	gulp.watch( './src/*.coffee', [ 'server:restart' ] );
});
