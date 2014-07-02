'use strict';

var should    = require( 'should' ),
	sinon     = require( 'sinon' ),
	gutil     = require( 'gulp-util' ),
	app       = require( '../' ),
	stubGutil = null;


describe( 'gulp-develop-server', function() {
	before( function() {
		stubGutil = sinon.stub( gutil, 'log' );
	});


	afterEach( function( done ) {
		app.reset( function() {
			stubGutil.reset();
			done();
		});
	});


	it( 'should listen server', function( done ) {
		var opt = {
			path: 'test/apps/app-no-message'
		};

		app.listen( opt, function( error ) {
			should.not.exist( error );
			should( app.child.connected ).be.true;
			should( gutil.log.lastCall.args[ 0 ] ).match( /server listening/ );
			done();
		});
	});


	it( 'should listen server by checking process.message', function( done ) {
		var opt = {
			path: 'test/apps/app'
		};

		app.listen( opt, function( error ) {
			should.not.exist( error );
			should( app.child.connected ).be.true;
			should( gutil.log.lastCall.args[ 0 ] ).match( /server listening/ );
			done();
		});
	});


	it( 'should listen express-server', function( done ) {
		var opt = {
			path: 'test/apps/app-express'
		};

		app.listen( opt, function( error ) {
			should.not.exist( error );
			should( app.child.connected ).be.true;
			should( gutil.log.lastCall.args[ 0 ] ).match( /server listening/ );
			done();
		});
	});


	it( 'should listen server with options.nodeArgs', function( done ) {
		var opt = {
			path: 'test/apps/app',
			nodeArgs: [ '--harmony' ]
		};

		app.listen( opt, function( error ) {
			should( app.options.nodeArgs ).eql( opt.nodeArgs );
			done();
		});
	});


	it( 'should listen server with options.env', function( done ) {
		var opt = {
			path: 'test/apps/app',
			env: { NODE_ENV: 'production', PORT: 1338 }
		};

		app.listen( opt, function( error ) {
			should( app.options.env ).eql( opt.env );
			done();
		});
	});


	it( 'should listen server with options.delay', function( done ) {
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


	it( 'should throw error when server broken', function() {
		var opt = {
			path: 'test/apps/app-broken'
		};

		app.listen( opt, function( error ) {
			should.exist( error );
			should( gutil.log.lastCall.args[ 0 ] ).match( /server error/ );
			done();
		});
	});


	it( 'should resetart server', function( done ) {
		var opt = {
			path: 'test/apps/app'
		};

		app.listen( opt, function() {
			app.restart( function( error ) {
				should.not.exist( error );
				should( app.child.connected ).be.true;
				should( gutil.log.args.length ).eql( 4 );
				should( gutil.log.lastCall.args[ 0 ] ).match( /server was restarted/ );
				done();
			});
		});
	});


	it( 'should kill server', function( done ) {
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
				should( gutil.log.lastCall.args[ 0 ] ).match( /server was stopped/ );
				done();
			});
		});
	});


	it( 'should kill server with signal: `SIGTERM`', function( done ) {
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
				should( gutil.log.lastCall.args[ 0 ] ).match( /server was stopped/ );
				done();
			});
		});
	});


	it( 'should kill server with options.signal: `SIGTERM`', function( done ) {
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
				should( gutil.log.lastCall.args[ 0 ] ).match( /server was stopped/ );
				done();
			});
		});
	});
});
