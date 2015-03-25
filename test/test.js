'use strict';

var _       = require( 'lodash' ),
	should  = require( 'should' ),
	sinon   = require( 'sinon' ),
	gutil   = require( 'gulp-util' ),
	request = require( 'supertest' ),
	app     = require( '../' );

var URL  = 'http://localhost:1337',
	stub = null;


describe( 'gulp-develop-server', function() {

	before( function() {
		stub = sinon.stub( gutil, 'log' );
	});


	afterEach( function( done ) {
		app.reset( function() {

			stub.reset();
			done();
		});
	});


	it( 'should listen the server', function( done ) {
		var opt = {
			path: 'test/apps/app-no-message'
		};

		app.listen( opt, function( error ) {
			should.not.exist( error );
			should( app.child.connected ).be.true;
			should( gutil.log.lastCall.args[ 0 ] ).match( /server listening/ );
			request( URL ).get( '/' ).expect( 200 ).end( done );
		});
	});


	it( 'should listen the server by checking message', function( done ) {
		var opt = {
			path: 'test/apps/app'
		};

		app.listen( opt, function( error ) {
			should.not.exist( error );
			should( app.child.connected ).be.true;
			should( gutil.log.lastCall.args[ 0 ] ).match( /server listening/ );
			request( URL ).get( '/' ).expect( 200 ).end( done );
		});
	});


	it( 'should listen the server by only checking message', function( done ) {
		var opt = {
			path: 'test/apps/app',
			delay: 0
		};

		app.listen( opt, function( error ) {
			should.not.exist( error );
			should( app.child.connected ).be.true;
			should( gutil.log.lastCall.args[ 0 ] ).match( /server listening/ );
			request( URL ).get( '/' ).expect( 200 ).end( done );
		});
	});


	it( 'should listen the express server', function( done ) {
		var opt = {
			path: 'test/apps/app-express',
			delay: 1200
		};

		app.listen( opt, function( error ) {
			should.not.exist( error );
			should( app.child.connected ).be.true;
			should( gutil.log.lastCall.args[ 0 ] ).match( /server listening/ );
			request( URL ).get( '/' ).expect( 200 ).end( done );
		});
	});


	it( 'should set --harmony options', function( done ) {
		var opt = {
			path: 'test/apps/app',
			execArgv: [ '--harmony' ]
		};

		app.listen( opt, function() {
			should( app.options.execArgv ).eql( opt.execArgv );
			done();
		});
	});


	it( 'should set --debug options', function( done ) {
		var opt = {
			path: 'test/apps/app-no-message',
			execArgv: [ '--debug' ]
		};

		app.listen( opt, function( error ) {
			should.not.exist( error );
			should( app.child.connected ).be.true;
			should( gutil.log.lastCall.args[ 0 ] ).match( /server listening/ );
			request( URL ).get( '/' ).expect( 200 ).end( done );
		});
	});


	it( 'should set `options.args`', function( done ) {
		var opt = {
			path: 'test/apps/app-args-check',
			args: [ 'param-1', 'param-2' ]
		};

		app.listen( opt, function() {
			should( app.options.args ).eql( opt.args );
			done();
		});
	});


	it( 'should set `options.env`', function( done ) {
		var opt = {
			path: 'test/apps/app',
			env: { NODE_ENV: 'production', PORT: 1338 }
		};

		app.listen( opt, function() {
			should( app.options.env.NODE_ENV ).eql( opt.env.NODE_ENV );
			should( app.options.env.PORT ).eql( opt.env.PORT );
			done();
		});
	});


	it( 'should include current environmental variables by default', function( done ) {
		var opt = {
			path: 'test/apps/app'
		};
		var envExtended = _.extend( { NODE_ENV: 'development' }, process.env );

		app.listen( opt, function() {
			should( app.options.env ).eql( envExtended );
			done();
		});
	});


	it( 'should listen the server with `options.delay`', function( done ) {
		var opt = {
			path: 'test/apps/app-no-message',
			delay: 50
		};
		var now = Date.now();

		app.listen( opt, function() {
			var delay = Date.now() - now;

			should( delay ).within( 50, 80 );
			should( app.options.delay ).eql( opt.delay );
			done();
		});
	});


	it( 'should throw an error when options.path is empty', function() {
		should( function() {
			app.listen( {} );
		}).throw();
	});


	it( 'should throw an error if the server is broken', function( done ) {
		var opt = {
			path: 'test/apps/app-broken'
		};

		app.listen( opt, function( error ) {
			should.exist( error );
			should( gutil.log.lastCall.args[ 0 ] ).match( /server has error/ );
			done();
		});
	});


	it( 'should restart the server', function( done ) {
		var opt = {
			path: 'test/apps/app'
		};

		app.listen( opt, function() {
			var pid = app.child.pid;

			app.restart( function( error ) {
				should.not.exist( error );
				should( app.child.connected ).be.true;
				should( gutil.log.args.length ).eql( 4 );
				should( gutil.log.lastCall.args[ 0 ] ).match( /server was restarted/ );
				should( app.child.pid ).not.eql( pid );
				request( URL ).get( '/' ).expect( 200 ).end( done );
			});
		});
	});


	it( 'should restart the server by Stream', function( done ) {
		var opt = {
			path: 'test/apps/app',
		};
		var file = new gutil.File({
			base: __dirname + '/test/apps/',
			cwd:  __dirname,
			path: __dirname + '/test/apps/app.js'
		});
		var stream = app();

		app.listen( opt, function() {
			var pid = app.child.pid;

			stream.write( file );

			stream.once( 'data', function() {
				should( app.child.connected ).be.true;
				should( gutil.log.args.length ).eql( 4 );
				should( gutil.log.lastCall.args[ 0 ] ).match( /server was restarted/ );
				should( app.child.pid ).not.eql( pid );
				request( URL ).get( '/' ).expect( 200 ).end( done );
			});
		});
	});


	it( 'should restart the server properly when `server.restart` called twice.', function( done ) {
		var opt = {
			path: 'test/apps/app'
		};

		app.listen( opt, function() {
			var pid = app.child.pid;

			app.restart( function() {
				should( app.child.connected ).be.true;
				should( app.child.pid ).not.eql( pid );
				done();
			});

			app.restart( function( error ) {
				should( error ).match( /already received restart requests/ );
			});
		});
	});


	it( 'should show an error when `server.listen` called twice', function( done ) {
		var opt = {
			path: 'test/apps/app'
		};

		app.listen( opt, function() {
			var pid = app.child.pid;

			app.listen( opt, function( error ) {
				should( app.child.connected ).be.true;
				should( app.child.pid ).eql( pid );
				should( error ).match( /already started/ );
				done();
			});
		});
	});


	it( 'should show an error when `server.kill` called twice', function( done ) {
		var opt = {
			path: 'test/apps/app'
		};

		app.listen( opt, function() {
			app.kill( function() {
				app.kill( function( error ) {
					should( app.child ).be.null;
					should( error ).match( /already stopped/ );
					done();
				});
			});
		});
	});


	it( 'should throw an error when called `server.restart` before `server.listen`', function() {
		should( function() {
			app.restart();
		}).throw();
	});


	it( 'should kill the server', function( done ) {
		var opt = {
			path: 'test/apps/app'
		};

		app.listen( opt, function() {
			app.kill( function( error ) {
				should.not.exist( error );
				should( app.child ).eql( null );
				should( gutil.log.args.length ).eql( 2 );
				should( gutil.log.lastCall.args[ 0 ] ).match( /server was stopped/ );
				done();
			});
		});
	});


	it( 'should kill the server by signal: `SIGTERM`', function( done ) {
		var opt = {
			path: 'test/apps/app'
		};

		app.listen( opt, function() {
			app.kill( 'SIGTERM', function( error ) {
				should.not.exist( error );
				should( app.child ).eql( null );
				should( gutil.log.args.length ).eql( 2 );
				should( gutil.log.lastCall.args[ 0 ] ).match( /server was stopped/ );
				done();
			});
		});
	});


	it( 'should kill the server by options.signal: `SIGTERM`', function( done ) {
		var opt = {
			path: 'test/apps/app',
			killSignal: 'SIGTERM'
		};

		app.listen( opt, function() {
			should( app.options.killSignal ).eql( opt.killSignal );

			app.kill( function( error ) {
				should.not.exist( error );
				should( app.child ).eql( null );
				should( gutil.log.args.length ).eql( 2 );
				should( gutil.log.lastCall.args[ 0 ] ).match( /server was stopped/ );
				done();
			});
		});
	});


	it( 'should reset the server', function( done ) {
		var opt = {
			path: 'test/apps/app',
			testKey: true
		};

		app.listen( opt, function() {
			should( opt ).have.ownProperty( 'testKey' );

			app.reset( function( error ) {
				should.not.exist( error );
				should( app.options ).not.have.ownProperty( 'testKey' );
				should( app.child ).eql( null );
				should( gutil.log.args.length ).eql( 2 );
				should( gutil.log.lastCall.args[ 0 ] ).match( /server was stopped/ );
				done();
			});
		});
	});
});
