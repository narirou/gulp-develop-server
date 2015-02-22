'use strict';

var _          = require( 'lodash' ),
	gutil      = require( 'gulp-util' ),
	Transform  = require( 'stream' ).Transform,
	fork       = require( 'child_process' ).fork,
	pluginName = 'gulp-develop-server';


function started( error, callback ) {
	if( ! error && app.child ) {
		gutil.log( 'Development server listening. (PID:' + gutil.colors.magenta( app.child.pid ) + ')' );
	}
	if( typeof callback === 'function' ) {
		callback( error );
	}
}


function stopped( error, callback ) {
	if( ! error && app.child ) {
		gutil.log( 'Development server was stopped. (PID:' + gutil.colors.magenta( app.child.pid ) + ')' );
		app.child = null;
	}
	if( typeof callback === 'function' ) {
		callback( error );
	}
}


function restarted( error, callback ) {
	if( ! error && app.child ) {
		gutil.log( gutil.colors.cyan( 'Development server was restarted.' ) );
	}
	if( typeof callback === 'function' ) {
		callback( error );
	}
}


function app( options ) {
	var stream = new Transform( { objectMode: true } ),
		isStream = false;

	// override default options
	if( ! app.child && typeof options === 'object' ) {
		_.merge( app.options, options );
	}

	stream._transform = function( file, encoding, callback ) {
		var pushFile = function() {
			stream.push( file );
			callback();
		};

		if( ! isStream ) {
			isStream = true;
			return app.changed( pushFile );
		}

		pushFile();
	};

	stream.on( 'finish', function() {
		isStream = false;
	});

	return stream;
}


app.child = null;


app.isChanged = false;


app.defaultOptions = {
	path: '',
	env: _.extend( { NODE_ENV: 'development' }, process.env ),
	execArgv: [],
	delay: 600,
	successMessage: /^server listening$/,
	killSignal: 'SIGTERM'
};


app.options = _.cloneDeep( app.defaultOptions );


app.listen = function( options, callback ) {

	// throw error when options is not set
	if( ! app.options.path && typeof options.path !== 'string' ) {
		throw new gutil.PluginError( pluginName, 'application `path` required.' );
	}

	// fallback arguments
	if( typeof options === 'function' ) {
		callback = options;
		options = {};
	}

	// server already started
	if( app.child && app.child.connected ) {
		started( 'Development server already started.', callback );
		return app;
	}

	// override default options
	if( typeof options === 'object' ) {
		_.merge( app.options, options );
	}

	// run server process
	var child = fork( app.options.path, {
		cwd:      app.options.cwd,
		env:      app.options.env,
		encoding: app.options.encoding,
		execPath: app.options.execPath,
		execArgv: app.options.execArgv,
		silent:   true,
	});

	app.child = child;


	// run callback when server initialized
	var called = false,
		timer;

	var initialized = function( error ) {
		if( called ) {
			return;
		}
		if( timer ) {
			timer = clearTimeout( timer );
		}
		if( error ) {
			gutil.log( gutil.colors.red( error ) );
		}

		started( error || null, callback );
		called = true;

		child.stderr.removeListener( 'data', errorLisner );
		child.removeListener( 'message', successMessageListener );
	};


	// initialized by checking a timer
	if( app.options.delay > 0 ) {
		timer = setTimeout( initialized, app.options.delay );
	}


	// initialized by checking `success message`
	var successMessageListener = function( message ) {
		if( typeof message === 'string' && message.match( app.options.successMessage ) ) {
			initialized();
		}
	};
	child.once( 'message', successMessageListener );


	// initialized by error message if server has error
	// if Node debugger enabled by execArgv, debugging message comes at first
	var errorLisner = function( error ) {
		if( error instanceof Buffer && error.toString().match( /^Debugger listening/ ) ) {
			return;
		}
		if( error ) {
			initialized( 'Development server has error.' );
		}
	};
	child.stderr.on( 'data', errorLisner );


	// pipe child process's stdout / stderr
	child.stdout.pipe( process.stdout );
	child.stderr.pipe( process.stderr );

	return app;
};


app.kill = function( signal, callback ) {

	// fallback arguments
	if( typeof signal === 'function' ) {
		callback = signal;
		signal = app.options.killSignal;
	}
	else {
		signal = signal || app.options.killSignal;
	}

	// send kill signal
	if( app.child ) {
		app.child.once( 'close', function() {
			stopped( null, callback );
		});

		app.child.kill( signal );

		return app;
	}

	// server already stopped
	stopped( 'Development server already stopped.', callback );
	return app;
};


app.changed = app.restart = function( callback ) {

	// already called this function
	if( app.isChanged ) {
		restarted( 'Development server already received restart requests.', callback );
		return app;
	}

	// restart server
	var end = function( error ) {
		restarted( error, callback );
		app.isChanged = false;
	};

	app.isChanged = true;

	if( app.child && app.child.connected ) {

		return app.kill( function() {
			app.listen( end );
		});
	}

	// if server not started, try to start using options.path
	else if( app.options.path ) {
		return app.listen( end );
	}

	// server not started
	throw new gutil.PluginError( pluginName, 'Development server not started.' );
};


app.reset = function( signal, callback ) {

	// fallback arguments
	if( typeof signal === 'function' ) {
		callback = signal;
		signal = app.options.killSignal;
	}
	else {
		signal = signal || app.options.killSignal;
	}

	// kill server process and then reset options
	return app.kill( signal, function( error ) {
		app.options = _.cloneDeep( app.defaultOptions );

		if( typeof callback === 'function' ) {
			callback( error );
		}
	});
};


module.exports = app;
