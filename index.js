'use strict';

var _          = require( 'lodash' ),
	gutil      = require( 'gulp-util' ),
	Transform  = require( 'stream' ).Transform,
	fork       = require( 'child_process' ).fork,
	pluginName = 'gulp-develop-server';


function started( callback ) {
	return function() {
		if( app.child ) {
			gutil.log( 'development server listening. ( PID:', gutil.colors.magenta( app.child.pid ), ')' );
		}
		if( typeof callback === 'function' ) {
			callback();
		}
	};
}


function stopped( callback ) {
	return function() {
		if( app.child ) {
			gutil.log( 'development server was stopped. ( PID:', gutil.colors.magenta( app.child.pid ), ')' );
			app.child = null;
		}
		if( typeof callback === 'function' ) {
			callback();
		}
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
	var stream = new Transform( { objectMode: true } ),
		isRestarted = false;

	stream._transform = function( file, encoding, callback ) {
		if( ! isRestarted ) {
			isRestarted = true;
			app.changed( function() {
				stream.push( file );
				callback();
			});
		}
		else {
			this.push( file );
			callback();
		}
	};

	stream.end = function( file ) {
		isRestarted = false;
	};

	stream.changed = app.changed;

	return stream;
}


app.child = null;


app.defaultOptions = {
	path: '',
	env: { NODE_ENV: 'development' },
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

	// server already started
	if( app.child && app.child.connected ) {
		return gutil.log( 'development server already started.' );
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


	// run server process
	app.child = fork( app.options.path, {
		silent:   true,
		env:      app.options.env,
		execArgv: app.options.execArgv
	});


	// run callback
	//     if not receive an error after `options.delay` seconds,
	//     regard the server listening success.
	var timer;
	if( typeof callback === 'function' && app.options.delay > 0 ) {
		timer = setTimeout( started( callback ), app.options.delay );
	}

	app.child.once( 'message', function( message ) {
		if( timer && typeof message === 'string' && message.match( app.options.successMessage ) ) {
			clearTimeout( timer );
			started( callback )();
		}
	});

	app.child.stderr.once( 'data', function( error ) {
		if( error && timer ) {
			gutil.log( gutil.colors.red( 'development server error:' ) );
			clearTimeout( timer );
			callback( '' + error );
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
	else {
		signal = signal || app.options.killSignal;
	}

	// sending kill signall
	if( app.child && app.child.connected ) {
		app.child.once( 'close', stopped( callback ) );

		app.child.kill( signal );

		return app;
	}

	// server already stopped
	if( typeof callback === 'function' ) {
		callback();
	}

	return app;
};


app.changed = app.restart = function( callback ) {

	if( app.child && app.child.connected ) {
		return app.kill( function() {
			app.listen( restarted( callback ) );
		});
	}

	// server not started, but try to start using options.path
	else if( app.options.path ) {
		return app.listen( restarted( callback ) );
	}

	// server not started
	throw new gutil.PluginError( pluginName, 'development server not started.' );
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

	return app.kill( signal, function() {
		app.options = _.cloneDeep( app.defaultOptions );
		stopped( callback )();
	});
};


module.exports = app;
