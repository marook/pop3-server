var events = require('events');
var net = require('net');

function create_server(connection_handler){
    var socket = net.createServer(function(socket_connection){
        var pop_connection = create_pop_connection(socket_connection);

        connection_handler(pop_connection);
    });

    function listen(port){
        socket.listen(port);
    }
    
    return {

        listen: listen

    };
}

function create_pop_connection(socket_connection){
    var pop_connection = new events.EventEmitter();

    // TODO

    return pop_connection;
}

module.exports.create_server = create_server;
