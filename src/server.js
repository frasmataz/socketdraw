var http = require('http');
var io = require('socket.io');
var fs = require('fs');
var url = require('url');

var trails = [];

var notFound = function(req, res, path) {
    res.writeHead(404);
    res.write('Couldn\'t find this.  Good job mate.\n');
    res.write(path.toString());
};

var server = http.createServer(function(req, res) {
    var path = url.parse(req.url).pathname;

    if (path == '/')
        path = '/index.htm';

    fs.readFile(__dirname+path, function(error, data) {
        if(error) {
            notFound(req,res,path);
        } else {
            res.writeHead(200);
            res.write(data, 'utf8');
        }
        res.end();
    })
});

server.listen(8085);

var socketserv = io.listen(server);

socketserv.sockets.on('connection', function(socket) {
    console.log("Connected");

    var currentTrail;
    var colour = '#'+Math.floor(Math.random()*16777215).toString(16);

    setInterval(function () {
        socket.emit('addclick', trails);
    }, 700);

    socket.emit('start', {
        trails : trails,
        colour : colour
    });

    socket.on('startPath', function() {
        var newTrail = {
            x : [],
            y : [],
            c: colour
        };
        trails.push(newTrail);
        currentTrail = trails.indexOf(newTrail);
        console.log('Drawing...');
    });

    socket.on('endPath', function(id) {
        currentTrail = null;
        socketserv.sockets.emit('addclick', trails);
    });

    socket.on('addclick', function(data) {
	if (data != undefined) {
        	trails[currentTrail].x.push(data.x);
	        trails[currentTrail].y.push(data.y);
        	socket.emit('addclick', trails);
	}
    });

    socket.on('clear', function() {
        console.log('clearing');
        trails = [];
        socketserv.sockets.emit('clear');
    });

});

