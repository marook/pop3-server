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
        var cmd = parse_command_from_buffer(data);

        if(cmd.name === 'CAPA'){
            pop_connection.emit('capa');
        }
        else if(cmd.name === 'USER'){
            pop_connection.emit('user', cmd.args[0]);
        }
        else if(cmd.name === 'PASS'){
            pop_connection.emit('pass', cmd.args[0]);
        }
        else if(cmd.name === 'STAT'){
            pop_connection.emit('stat', function(number_of_messages, overall_size){
                pop_connection.send_line('+OK ' + number_of_messages + ' ' + overall_size);
            });
        }
        else if(cmd.name === 'QUIT'){
            pop_connection.emit('quit');
        }
        else if(cmd.name === 'UIDL'){
            var single_uid = cmd.args.length !== 0;
            var filter_index = single_uid ? cmd.args[0] : null;

            pop_connection.emit('uidl', filter_index, function(mail_uids){
                if(single_uid){
                    if(mail_uids.length === 0){
                        pop_connection.send_line('-ERR no such message');
                    }
                    else{
                        var first_mail = mail_uids[0];

                        pop_connection.send_line('+OK ' + filter_index + ' ' + first_mail.uid);
                    }
                }
                else{
                    pop_connection.send_line('+OK');

                    for(var i = 0; i < mail_uids.length; ++i){
                        pop_connection.send_line('' + (i + 1) + ' ' + mail_uids[i].uid);
                    }

                    pop_connection.send_line('.');
                }
            });
        }
        else if(cmd.name === 'LIST'){
            pop_connection.emit('list', function(mails){
                pop_connection.send_line('+OK');

                for(var i = 0; i < mails.length; ++i){
                    pop_connection.send_line('' + (i + 1) + ' ' + mails[i].size);
                }

                pop_connection.send_line('.');
            });
        }
        else if(cmd.name === 'RETR'){
            var mail_index = parseInt(cmd.args[0], 10);

            pop_connection.emit('retr', mail_index, function(mail){
                pop_connection.send_line('+OK');
                pop_connection.send_line(mail.body);
                pop_connection.send_line('.');
            });
        }
        else{
            // TODO fail
            console.log('unknown cmd: >>>' + JSON.stringify(cmd) + '<<<');
        }
    });

    bind_pop3_commands(pop_connection);

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

function bind_pop3_commands(pop_connection){
    var user = null;

    pop_connection.on('capa', function(){
        this.send_line('.');
    });

    pop_connection.on('user', function(user_name){
        user = user_name;

        this.send_line('+OK');
    });

    pop_connection.on('pass', function(password){
        pop_connection.emit('authentication', user, password, function(valid_credentials){
            if(valid_credentials){
                pop_connection.send_line('+OK');
            }
            else{
                // TODO end connection
            }
        });
    });

    pop_connection.on('quit', function(){
        pop_connection.send_line('+OK bye');
    });
}

module.exports.create_server = create_server;

module.exports.create_pop_connection = create_pop_connection;
