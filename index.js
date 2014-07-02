'use strict';

var _         = require( 'lodash' ),
	gutil     = require( 'gulp-util' ),
	Transform = require( 'stream' ).Transform,
	fork      = require( 'child_process' ).fork;


function started( callback ) {
	return function() {
		gutil.log( 'development server listening. ( PID:', gutil.colors.magenta( app.child.pid ), ')' );
		if( callback ) callback();
	};
}


function stopped( callback ) {
	return function() {
		if( app.child ) {
			gutil.log( 'development server was stopped. ( PID:', gutil.colors.magenta( app.child.pid ), ')' );
			app.child = null;
		}
		if( callback ) callback();
	};
}


function restarted( callback ) {
	return function( error ) {
		if( ! error ) {
			gutil.log( gutil.colors.cyan( 'development server was restarted.' ) );
		}
		if( typeof callback === 'function' ) {
			callback( error );
		}
	};
}


function app() {
	var stream = new Transform({ objectMode: true });

	stream._transform = function( file, encoding, callback ) {
		this.push( file );
		app.changed( callback );
	};

	stream.changed = app.changed;

	return stream;
}


app.child = null;


app.defaultOptions = {
	path: '',
	env: { NODE_ENV: 'development' },
	nodeArgs: [],
	delay: 600,
	successMessage: /^server listening$/,
	killSignal: 'SIGTERM'
};


app.options = _.cloneDeep( app.defaultOptions );


app.listen = function( options, callback ) {

	// throw error when options is not set
	if( ! app.options.path && typeof options.path !== 'string' ) {
		throw new gutil.PluginError( 'gulp-develop-server', 'application `path` required.' );
	}

	// fallback arguments
	if( typeof options === 'function' ) {
		callback = options;
		options = {};
	}
	// override default options
	else if( typeof options === 'object' ) {
		_.merge( app.options, options );
	}


	// add Node's arguments
	var args = app.options.nodeArgs;

	if( args instanceof Array && args.length ) {
		args.forEach( function( arg ){
			process.execArgv.push( arg );
		});
	}


	// run server process
	app.child = fork( app.options.path, { silent: true, env: app.options.env } );


	// run callback
	//     if not receive an error after `options.delay` seconds,
	//     regard the server listening success.
	var timer = setTimeout( started( callback ), app.options.delay );

	// timer.unref();

	app.child.on( 'message', function( message ) {
		if( timer && typeof message === 'string' && message.match( app.options.successMessage ) ) {
			clearTimeout( timer );
			started( callback )();
		}
	});

	app.child.stderr.on( 'data', function( error ) {
		gutil.log( gutil.colors.red( 'development server error:' ) );

		if( timer ) clearTimeout( timer );

		if( callback ) {
			var errorMessage = '' + error || null;
			callback( errorMessage );
		}
	});


	// pipe child process's stdout / stderr
	app.child.stdout.pipe( process.stdout );
	app.child.stderr.pipe( process.stderr );

	return app;
};


app.kill = function( signal, callback ) {

	// fallback arguments
	if( typeof signal === 'function' ) {
		callback = signal;
		signal = app.options.killSignal;
	}

	// sending kill signall
	if( app.child && app.child.connected ) {
		app.child.on( 'exit', stopped( callback ) );

		app.child.kill( signal );

		return app;
	}

	// server already stopped
	if( typeof callback === 'function' ) {
		process.nextTick( callback );
	}

	return app;
};


app.changed = app.restart = function( callback ) {
	return app.kill( function() {
		app.listen( restarted( callback ) );
	});
};


app.reset = function( callback ) {
	return app.kill( function() {
		app.options = _.cloneDeep( app.defaultOptions );

		if( callback ) callback();
	})
}


module.exports = app;
