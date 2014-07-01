gulp-develop-server
====================

> a gulp plugin: automatically restert the node server for development.



example with gulp-livereload
-------

```javascript
var gulp       = require( 'gulp' ),
    server     = require( 'gulp-develop-server' ),
    livereload = require( 'gulp-livereload' );

gulp.task( 'server', function() {
    server.listen( { path: 'app.js' }, livereload.listen );
});

gulp.task( 'watch', [ 'server' ], function() {
    function restartServer() {
        server.changed( function( error ) {
            if( ! error ) livereload.changed();
        });
    }
    
    gulp.watch( [ 'app.js', 'routes/**/*.js' ], restartServer );
});

gulp.task( 'default', [ 'watch' ] );

```
