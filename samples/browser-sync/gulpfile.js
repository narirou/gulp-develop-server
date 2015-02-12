'use strict';

var gulp   = require( 'gulp' ),
    server = require( '../../../gulp-develop-server' ),
    bs     = require( 'browser-sync' );

var options = {
    server: {
        path: './apps/app.js',
        execArgv: [ '--harmony' ]
    },
    bs: {
        proxy: 'http://localhost:3000'
    }
};

var serverFiles = [
    './apps/app.js',
    './routes/*.js'
];

gulp.task( 'server:start', function() {
    server.listen( options.server, function( error ) {
        if( ! error ) bs( options.bs );
    });
});

// If server scripts change, restart the server and then browser-reload.
gulp.task( 'server:restart', function() {
    server.restart( function( error ) {
        if( ! error ) bs.reload();
    });
});

gulp.task( 'default', [ 'server:start' ], function() {
    gulp.watch( serverFiles, [ 'server:restart' ] );
});
