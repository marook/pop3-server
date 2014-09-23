var events = require('events');
var net = require('net');

function create_server(connection_handler){
    var socket = net.createServer(function(socket_connection){
        var pop_connection = create_pop_connection(socket_connection);

        connection_handler(pop_connection);

        pop_connection.send_hello();
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

    pop_connection.socket_connection = socket_connection;
    pop_connection.send_hello = send_hello;
    pop_connection.send_line = send_line;

    socket_connection.on('data', function(data){
        console.log('data: ' + data);

        var cmd = parse_command_from_buffer(data);

        if(cmd.name === 'CAPA'){
            pop_connection.emit('capa');
        }
        else{
            // TODO fail
            console.log('cmd: >>>' + cmd.name + '<<<');
        }
    });

    pop_connection.on('capa', function(){
        this.send_line('.');
    });

    pop_connection.send_hello();

    return pop_connection;
}

function parse_command_from_buffer(data){
    var tokens = [];

    tokenize_command_line_from_buffer(tokens, data);

    if(tokens.length <= 0){
        return {
            name: null,
            args: []
        };
    }

    return {
        name: tokens[0],
        args: tokens.splice(1)
    };
}

function tokenize_command_line_from_buffer(tokens, data){
    var current_token = '';

    for(var i = 0; i < data.length - 1; ++i){
        var c = data.toString('ASCII', i, i + 1);
        var c1 = data.toString('ASCII', i + 1, i + 2);

        if(c === '\r' && c1 === '\n'){
            break;
        }
        else if(c === ' '){
            tokens.push(current_token);
            current_token = '';
        }
        else{
            current_token += c;
        }
    }

    if(current_token.length > 0){
        tokens.push(current_token);
    }
}

function send_hello(){
    this.send_line('+OK pop3-server POP3-Server');
}

function send_line(line){
    this.socket_connection.write(line);
    this.socket_connection.write('\r\n');
}

module.exports.create_server = create_server;
