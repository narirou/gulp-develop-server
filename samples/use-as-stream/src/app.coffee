http = require 'http'

port = 3000

server = http.createServer ( req, res ) ->
	res.writeHead 200,
		'Content-Type': 'text/plain'
	res.end 'Hello World\n'

server.listen port, ->
	process.send( 'server listening' )
