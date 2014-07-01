gulp-develop-server
====================

> a gulp plugin: automatically restert the node server for development.



examples
-------

*simple:*
```javascript
var gulp       = require( 'gulp' ),
    server     = require( 'gulp-develop-server' );

gulp.task( 'startServer', function() {
    server.listen( { path: 'app.js' } );
});

gulp.task( 'default', [ 'startServer' ], function() {
	 gulp.watch( [ 'app.js' ], server.changed );
});
```


*with gulp-livereload:*  

```javascript
var gulp       = require( 'gulp' ),
    server     = require( 'gulp-develop-server' ),
    livereload = require( 'gulp-livereload' );

gulp.task( 'startServer', function() {
    server.listen( { path: 'app.js' }, livereload.listen );
});

gulp.task( 'watch', [ 'startServer' ], function() {
    function restartServer() {
        server.changed( function( error ) {
            if( ! error ) livereload.changed();
        });
    }
    
    gulp.watch( [ 'app.js', 'routes/**/*.js' ], restartServer );
});

gulp.task( 'default', [ 'watch' ] );
```
