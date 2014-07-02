gulp-develop-server
====================

> a gulp plugin: run your node.js server and automatically restart for development.




<!-- installation
------------

```bash
npm install --save-dev gulp-develop-server
```
 -->



api
---
####listen( options [, callback] )
#####options {Object}
 * `path`
 * `env`
 * `nodeArgs`
 * `delay`
 * `successMessage`
 * `killSignal`

#####callback( error )

************


####changed( [callback] )
callback( error )


************


####kill( [signal, callback] )
 signal {String}
 callback( error )
 sending kill message to server process.





examples
-------

####simple:

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


####with gulp-livereload:

```javascript
var gulp       = require( 'gulp' ),
    server     = require( 'gulp-develop-server' ),
    livereload = require( 'gulp-livereload' );

gulp.task( 'startServer', function() {
    server.listen( { path: 'app.js' }, livereload.listen );
});

// If server scripts change, restart the server and then livereload.
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



####with Stream:

```javascript
var gulp       = require( 'gulp' ),
    changed    = require( 'gulp-changed' ),
    server     = require( 'gulp-develop-server' ),
    livereload = require( 'gulp-livereload' );

gulp.task( 'startServer', function() {
    server.listen( { path: 'app.js' }, livereload.listen );
});

gulp.task( 'restartServer', [ 'startServer' ], function() {
    gulp.src( [ 'app.js' ], { read: false } )
        .pipe( changed( './' ) )
        .pipe( server() )
        .pipe( livereload() );
});
```
