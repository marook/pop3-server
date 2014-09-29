var events = require('events');
var util = require('util');

function SocketMock(){
    this.written = '';
}

util.inherits(SocketMock, events.EventEmitter);

SocketMock.prototype.write = function(s){
    this.written += s;
};

module.exports.SocketMock = SocketMock;
