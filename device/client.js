var EtherPortClient = require("etherport-client").EtherPortClient;
var five = require("johnny-five");
var board, led,led2, button;
var socket = require('socket.io-client')('http://192.168.173.1:8080');

var state = 0; //0 - disarmed, 1 - armed, 2 - warning, 3 - alarm
var ledstatus = false;
var delay = 1000;

var board = new five.Board({
    port: new EtherPortClient({
        host: "192.168.173.113", // #TODO update esp device ip
        port: 3030
    }),
    timeout: 1e5,
    repl: true
});

function handleState() {
	switch(state){
		case 0:
			led2.strobe(2000);
			led.stop();
			led.off();
			break;
		case 1:
			led2.stop();
			led2.off();
			led.strobe(1000);
			break;
		case 2:
			led2.stop();
			led2.on();
			led.strobe(1000);
			//board.wait(3000, function() {
			//	console.log("ALARM");
			//	socket.emit('alertRequest', true);
			//});
			break;
		case 3:
			led2.strobe(100);
			led.strobe(100);
			break;
	}
}


board.on("ready", function() {
    console.log("READY!");

    led = new five.Led(3).on();
    led2 = new five.Led(4).on();
	
    handleState();

    button = new five.Button({
        pin: 12,
        isPullup: true
    });

    button.on("down", function(value) {
        socket.emit('movementDetected', true);
    });

});


socket.on('news', function(data) {
    console.log(data);
});


socket.on('systemStateReply', function(data) {
    console.log("System state: " + data);
    state = data;
    if (board.isReady) {
		handleState();
    }
});