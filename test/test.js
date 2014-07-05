'use strict';

var should  = require( 'should' ),
	sinon   = require( 'sinon' ),
	gutil   = require( 'gulp-util' ),
	request = require( 'supertest' ),
	app     = require( '../' );

var url  = 'http://localhost:1337',
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
			request( url ).get( '/' ).expect( 200 ).end( done );
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
			request( url ).get( '/' ).expect( 200 ).end( done );
		});
	});


	it( 'should listen the express server', function( done ) {
		var opt = {
			path: 'test/apps/app-express'
		};

		app.listen( opt, function( error ) {
			should.not.exist( error );
			should( app.child.connected ).be.true;
			should( gutil.log.lastCall.args[ 0 ] ).match( /server listening/ );
			request( url ).get( '/' ).expect( 200 ).end( done );
		});
	});


	it( 'should set `options.execArgv`', function( done ) {
		var opt = {
			path: 'test/apps/app',
			execArgv: [ '--harmony' ]
		};

		app.listen( opt, function( error ) {
			should( app.options.execArgv ).eql( opt.execArgv );
			done();
		});
	});


	it( 'should set `options.env`', function( done ) {
		var opt = {
			path: 'test/apps/app',
			env: { NODE_ENV: 'production', PORT: 1338 }
		};

		app.listen( opt, function( error ) {
			should( app.options.env ).eql( opt.env );
			done();
		});
	});


	it( 'should listen the server with `options.delay`', function( done ) {
		var opt = {
			path: 'test/apps/app-no-message',
			delay: 50
		};
		var now = Date.now();

		app.listen( opt, function( error ) {
			var delay = Date.now() - now;

			should( delay ).within( 50, 80 );
			should( app.options.delay ).eql( opt.delay );
			done();
		});
	});


	it( 'should throw error when options.path is empty', function() {
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
			should( gutil.log.lastCall.args[ 0 ] ).match( /server error/ );
			done();
		});
	});


	it( 'should resetart the server', function( done ) {
		var opt = {
			path: 'test/apps/app'
		};

		app.listen( opt, function( error ) {
			should.not.exist( error );
			should( app.child.connected ).be.true;
			should( gutil.log.lastCall.args[ 0 ] ).match( /server listening/ );
			var pid = app.child.pid;

			app.restart( function( error ) {
				should.not.exist( error );
				should( app.child.connected ).be.true;
				should( gutil.log.args.length ).eql( 4 );
				should( gutil.log.lastCall.args[ 0 ] ).match( /server was restarted/ );
				should( app.child.pid ).not.eql( pid );
				request( url ).get( '/' ).expect( 200 ).end( done );
			});
		});
	});


	it( 'should throw an error if call `server.restart` before `server.listen`', function() {

		should( function() {
			app.restart();
		}).throw();
	});


	it( 'should kill the server', function( done ) {
		var opt = {
			path: 'test/apps/app'
		};

		app.listen( opt, function( error ) {
			should.not.exist( error );
			should( app.child.connected ).be.true;
			should( gutil.log.lastCall.args[ 0 ] ).match( /server listening/ );

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

		app.listen( opt, function( error ) {
			should.not.exist( error );
			should( app.child.connected ).be.true;
			should( gutil.log.lastCall.args[ 0 ] ).match( /server listening/ );

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

		app.listen( opt, function( error ) {
			should( app.options.killSignal ).eql( opt.killSignal );
			should.not.exist( error );
			should( app.child.connected ).be.true;
			should( gutil.log.lastCall.args[ 0 ] ).match( /server listening/ );

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

		app.listen( opt, function( error ) {
			should.not.exist( error );
			should( app.options.testKey ).be.true;
			should( app.child.connected ).be.true;
			should( gutil.log.lastCall.args[ 0 ] ).match( /server listening/ );

			app.reset( function( error ) {
				should.not.exist( error );
				should( app.options ).not.have.key( 'testKey' );
				should( app.child ).eql( null );
				should( gutil.log.args.length ).eql( 2 );
				should( gutil.log.lastCall.args[ 0 ] ).match( /server was stopped/ );
				done();
			});
		});
	});
});
