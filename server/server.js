var app = require('http').createServer(handler);
var io = require('socket.io').listen(app);
var fs = require('fs');

var state = 0; //0 - disarmed, 1 - armed, 2 - warning, 3 - alarm


// make web server listen on port 8080
app.listen(8080);

// handle web server
function handler (req, res) {
  fs.readFile(__dirname + '/index.html',

  function (err, data) {
    if (err) {
      res.writeHead(500);
      return res.end('Error while loading index.html');
    }

    res.writeHead(200);
	res.write(data);
    res.end();
  });
}


// on a socket connection
io.sockets.on('connection', function (socket) {
  
  socket.emit('news', { connected: 'true' });
  
  io.sockets.emit('systemStateReply',state);

  socket.on('checkState',function(data){
	socket.emit('systemStateReply', state);
	console.log("State check request");
  });
    
	
  //set armed/disarmed button clicked (web)
  socket.on('enableToggle', function (data) {
	if(state == 0) {
		state = 1;
		console.log("System armed");
	}
	else {
		state = 0;
		console.log("System disarmed");
	}
	
	io.sockets.emit('systemStateReply',state);
  });
  
  
  //movement detected
  socket.on('movementDetected', function (data) {
	if(state==1){
		console.log("Movement detected!");
		state = 2;
		io.sockets.emit('systemStateReply',state);
		
		setTimeout(function(){
			console.log("ALARM");
		state = 3;
		io.sockets.emit('systemStateReply',state);
		},5000);
	}
	else{
		console.log("SYSTEM IS OFFLINE");
	}
  });
  
  /*
  socket.on('alertRequest', function (data) {
	if(state > 0){
		console.log("ALARM!");
		state = 3;
		io.sockets.emit('systemStateReply',state);
	}
	else{
		console.log("SYSTEM IS OFFLINE");
	}
  });*/
  
});
