gulp-develop-server
====================

> run your node.js server and automatically restart with gulp.

[![Build Status](http://img.shields.io/travis/narirou/gulp-develop-server/master.svg?style=flat-square)](https://travis-ci.org/narirou/gulp-develop-server)
[![Npm Modules](http://img.shields.io/npm/v/gulp-develop-server.svg?style=flat-square)](https://www.npmjs.org/package/gulp-develop-server)
[![MIT Licensed](http://img.shields.io/badge/license-MIT-blue.svg?style=flat-square)](http://opensource.org/licenses/MIT)


gulp-develop-server is a development assistant for node.js server that runs
the process and automatically restarts it when a file is modified. 


installation
------------

```bash
npm install gulp-develop-server --save-dev
```



usage
-----

```javascript
var gulp   = require( 'gulp' ),
    server = require( 'gulp-develop-server' );

// run server
gulp.task( 'server:start', function() {
    server.listen( { path: './app.js' } );
});

// restart server if app.js changed
gulp.task( 'server:restart', function() {
    gulp.watch( [ './app.js' ], server.restart )
});
```



api
---

###server.listen( options[, callback] )

**options {Object}**  

- `path`  
    - type: {String}
    - exapmle: `'./your_node_app.js'`
    - Your node application path. This option is required.

- `env`  
    - type: {Object}  
    - default: `{ NODE_ENV: 'development' }`  
    - example: `{ PORT: 3000, NODE_ENV: 'production' }`  
    - Environment settings of your server.  

- `execArgv`  
    - type: {Array}  
    - example: `[ '--harmony' ]`  
    - Run node process with this options.  

- `delay`   
    - type: {Number}  
    - default: `600`  
    - If not receive an error from the server after `options.delay` seconds, regard the server listening success.
    - This option needs to adjust according to your application's initialize time.
    - If this option set `0`, it will only check `successMessage`.  

- `successMessage`  
    - type: {RegExp}
    - default: `/^server listening$/`  
    - If your application send a specific message by `process.send` method, regard the server listening success.

- `killSignal`  
    - type: {String}
    - default: `SIGTERM`

**callback( error )**  


###server.restart( [callback] ) / server.changed( [callback] )

**callback( error )**  


###server( [options] )

Create a `Transform` stream.
Restart the server at once when this stream gets files.


###server.kill( [signal, callback] )

Send kill signal to the server process.  
**signal {String}**  
**callback( error )**  


###server.reset( [signal, callback] )

Send kill signal to the server process and reset the options to default.   
**signal {String}**  
**callback( error )**  



more examples
-------------

####with [gulp-livereload](https://github.com/vohof/gulp-livereload):
(recommend)

```javascript
var gulp       = require( 'gulp' ),
    server     = require( 'gulp-develop-server' ),
    livereload = require( 'gulp-livereload' );

gulp.task( 'server:start', function() {
    server.listen( { path: './apps/app.js' }, livereload.listen );
});

// If server scripts change, restart the server and then livereload.
gulp.task( 'server:restart', [ 'server:start' ], function() {
    
    function restart( file ) {
        server.changed( function( error ) {
            if( ! error ) livereload.changed( file.path );
        });
    }

    gulp.watch( [ './apps/app.js', './routes/**/*.js' ] ).on( 'change', restart );
});
```


####use as a stream:

```javascript
var gulp       = require( 'gulp' ),
    server     = require( 'gulp-develop-server' ),
    livereload = require( 'gulp-livereload' ),
    coffee     = require( 'gulp-coffee' );

var options = {
    path: './apps/app.js',
    execArgv: [ '--harmony' ]
};

// If server side's coffee files changed, compile these files,
// restart the server and then livereload.
gulp.task( 'server:restart', function() {
    gulp.src( './src/*.coffee' )
        .pipe( coffee() )
        .pipe( gulp.dest( './apps' ) )
        .pipe( server( options ) )
        .pipe( livereload() );
});

gulp.task( 'default', [ 'server:restart' ], function() {
    gulp.watch( './src/*.coffee', [ 'server:restart' ] );
});
```



thanks
------

[@pronebird](https://github.com/pronebird)
