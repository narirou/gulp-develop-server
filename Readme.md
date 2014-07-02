gulp-develop-server
====================

> a gulp plugin: run your node.js server and automatically restart for development.

[![Build Status](http://img.shields.io/travis/narirou/gulp-develop-server/master.svg?style=flat)](https://travis-ci.org/narirou/gulp-develop-server)


<!-- installation
------------

```bash
npm install --save-dev gulp-develop-server
```
 -->



api
---
###server.listen( options[, callback] )

**options {Object}**  

- `path`  
    - type: {String}
    - exapmle: `'./your_app.js'`
    - Main application path. This option is required.

- `env`  
    - type: {Object}  
    - default: `{ NODE_ENV: 'development' }`  
    - example: `{ PORT: 3000, NODE_ENV: 'production' }`  
    - Server environment settings.  

- `nodeArgs`  
    - type: {Array}  
    - example: `[ '--harmony', '--debug' ]`  
    - a node process will be forked with this options.  

- `delay`   
    - type: {Numeric}  
    - default: `600`  
    - if not receive an error after `options.delay` seconds, regard the server listening success.

- `successMessage`  
    - type: {RegExp}
    - default: `/^server listening$/`  
    - if your application send a specific message by process.send, regard the server listening success.

- `killSignal`  
    - type: {String}
    - default: `SIGTERM`
    - this option is used when exec server.kill.

**callback( error )**  


###server.restart( [callback] )
###server.changed( [callback] )

**callback( error )**  


###server()

Stream server restart function.  
caution: If many files send to this stream, the server try to restart many times.  


###server.kill( [signal, callback] )

sending kill message to server process.  
**signal {String}**  
**callback( error )**  





examples
--------

###simple:

```javascript
var gulp   = require( 'gulp' ),
    server = require( 'gulp-develop-server' );

gulp.task( 'startServer', function() {
    server.listen( { path: 'app.js' } );
});

gulp.task( 'default', [ 'startServer' ], function() {
     gulp.watch( [ 'app.js' ], server.changed );
});
```


###with gulp-livereload:

```javascript
var gulp       = require( 'gulp' ),
    server     = require( 'gulp-develop-server' ),
    livereload = require( 'gulp-livereload' );

gulp.task( 'startServer', function() {
    server.listen( { path: 'app.js' }, livereload.listen );
});

// If server scripts change, restart the server and then livereload.
gulp.task( 'default', [ 'startServer' ], function() {
    function restartServer() {
        server.changed( function( error ) {
            if( ! error ) livereload.changed();
        });
    }
    gulp.watch( [ 'app.js', 'routes/**/*.js' ], restartServer );
});
```



###with Stream:

```javascript
var gulp       = require( 'gulp' ),
    changed    = require( 'gulp-changed' ),
    server     = require( 'gulp-develop-server' ),
    livereload = require( 'gulp-livereload' );

gulp.task( 'startServer', function() {
    server.listen( { path: 'app.js' }, livereload.listen );
});

gulp.task( 'restartServer', [ 'startServer' ], function() {
    gulp.src( [ './app.js' ], { read: false } )
        .pipe( changed( './' ) )
        .pipe( server() )
        .pipe( livereload() );
});
```
