var pop3 = require('./lib/main.js');

function main(){
    var server = pop3.create_server(function(connection){
        console.log('Client connected');

        connection.on('authentication', function(user, pass, success){
            console.log('Authentication requested for ' + user + '/' + pass);

            return success(true);
        });

        connection.on('stat', function(callback){
            console.log('Stat requested');

            return callback(1, 236);
        });

        connection.on('list', function(callback){
            console.log('List requested');

            return callback(null, [
                {
                    message_index: 1,
                    message_size: 236
                }
            ]);
        });

        connection.on('uidl', function(index, callback){
            console.log('UID list: ' + index);

            callback([
                {
                    uid: 'm0'
                }
            ]);
        });
    });

    server.listen(110);
}

function create_command_handler(){
    // TODO
}

main();
