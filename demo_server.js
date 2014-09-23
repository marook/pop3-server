var pop3 = require('./lib/main.js');

function main(){
    var server = pop3.create_server(function(connection){
        var mails = [
            {
                uid: 'm1',
                size: 236,
                body: 'Date: Mon, 18 Oct 2004 04:11:45 +0200\r\n' +
                    'From: Someone <someone@example.org>\r\n' +
                    'To: you@example.org\r\n' +
                    'Subject: Some Subject\r\n' +
                    '\r\n' +
                    'Hello World!\r\n'
            },
            {
                uid: 'm2',
                size: 236,
                body: 'Date: Mon, 18 Oct 2004 04:11:45 +0200\r\n' +
                    'From: Someone <someone@example.org>\r\n' +
                    'To: you@example.org\r\n' +
                    'Subject: Some Subject\r\n' +
                    '\r\n' +
                    'Hello World!\r\n'
            }
        ];

        console.log('Client connected');

        connection.on('authentication', function(user, pass, success){
            console.log('Authentication requested for ' + user + '/' + pass);

            return success(true);
        });

        connection.on('stat', function(callback){
            console.log('Stat requested');

            // TODO sum up mail sizes
            return callback(mails.length, 236);
        });

        connection.on('list', function(callback){
            console.log('List requested');

            return callback(mails);
        });

        connection.on('uidl', function(index, callback){
            console.log('UID list: ' + index);

            callback(mails);
        });

        connection.on('retr', function(mail_index, callback){
            console.log('Retrieving message ' + mail_index);

            callback(mails[mail_index - 1]);
        });
    });

    server.listen(110);
}

main();
