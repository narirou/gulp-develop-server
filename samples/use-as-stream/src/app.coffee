http = require 'http'
gutil = require 'gulp-util'

port = 3000

server = http.createServer ( req, res ) ->
	res.writeHead 200,
		'Content-Type': 'text/html'
	res.end '<!doctype html><html><head></head><body>Hello World.</body></html>'

server.listen port, ->
	process.send 'server listening'

	# colored message
	message = gutil.colors.blue 'server listening'
	console.log message
