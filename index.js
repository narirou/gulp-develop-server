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

	// the server already started
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

	// run callback by checking a timer
	var called = false,
		timer;

	if( app.options.delay > 0 ) {
		timer = setTimeout( function() {
			called = true;
			started( null, callback );
		}, app.options.delay );
	}

	// run callback by checking `success message`
	child.once( 'message', function( message ) {
		if( ! called && typeof message === 'string' && message.match( app.options.successMessage ) ) {
			if( timer ) {
				timer = clearTimeout( timer );
			}
			called = true;
			started( null, callback );
		}
	});

	// run callback with error message if the server has error
	child.stderr.once( 'data', function( error ) {
		if( ! called && error ) {
			if( timer ) {
				timer = clearTimeout( timer );
			}
			var msg = 'Development server has error.';
			gutil.log( gutil.colors.red( msg ) );
			called = true;
			started( msg, callback );
		}
	});

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

	// the server already stopped
	stopped( 'Development server already stopped.', callback );
	return app;
};


app.changed = app.restart = function( callback ) {

	// already called this function
	if( app.isChanged ) {
		restarted( 'Development server already received restart requests.', callback );
		return app;
	}

	// restart the server
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

	// if the server not started, try to start using options.path
	else if( app.options.path ) {
		return app.listen( end );
	}

	// the server not started
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

	// kill the server process and then reset options
	return app.kill( signal, function( error ) {
		app.options = _.cloneDeep( app.defaultOptions );

		if( typeof callback === 'function' ) {
			callback( error );
		}
	});
};


module.exports = app;
