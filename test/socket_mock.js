var events = require('events');

function SocketMock(){
    this.written = '';
}

SocketMock.prototype = new events.EventEmitter();

SocketMock.prototype.write = function(s){
    this.written += s;
};

module.exports.SocketMock = SocketMock;
