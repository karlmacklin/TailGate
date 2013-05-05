var app = require('http').createServer(handler),
	io = require('socket.io').listen(app, {log:false}),
	fs = require('fs');

app.listen(8081);

var maxBuffer = 20000;

function handler (req, res) {
	fs.readFile(__dirname + '/html/index.html',
		function (err, data) {
			if (err) {
				res.writeHead(500);
				return res.end('Error loading index.html');
			}
			res.writeHead(200);
			res.end(data);
		});
}


io.sockets.on('connection', function (socket) {
	var currentWatcher;
	var currentFilesize;

	socket.emit('connected');

	socket.on('openFile', function (data) {
		fs.stat(data.filename, function(err, stat){

			if(currentWatcher)
				currentWatcher.close();

			if(err) {
				console.log(err);
				socket.emit('error', err.toString());
				return;
			}

			currentFilesize = stat.size;

			var start = (stat.size > maxBuffer)?(stat.size - maxBuffer):0;
			var stream = fs.createReadStream(data.filename,{start:start, end:stat.size});
			stream.addListener("error",function(err){
				socket.emit('error', err.toString());
			});
			stream.addListener("data", function(filedata){
				filedata = filedata.toString('utf-8');
				var lines;
				if(filedata.length >= maxBuffer){
					lines = filedata.slice(filedata.indexOf("\n")+1).split("\n");
				} else {
					lines = filedata.split("\n");
				}
				socket.emit('initialTextData',{ text : lines, filename: data.filename});
				startWatching(data.filename, socket);
				console.log('started watching '+data.filename);
			});
		});
	});


	function startWatching(filename, socket) {
		currentWatcher = fs.watch(filename, function(event){
			fs.stat(filename, function(err,stat){
				if(err) {
					console.log(err);
					socket.emit('error', err.toString());
					return;
				}
				if(currentFilesize > stat.size) {
					socket.emit('fileReset',{filename:filename});
					currentFilesize = stat.size;
					return;
				}
				var stream = fs.createReadStream(filename, { start: currentFilesize, end: stat.size});
				stream.addListener("error",function(err){
					socket.emit('error', err.toString());
				});
				stream.addListener("data", function(filedata) {
					socket.emit('continuousTextData',{ text : filedata.toString('utf-8').split("\n") });
					currentFilesize = stat.size;
				});
			});
		});
	}

});
