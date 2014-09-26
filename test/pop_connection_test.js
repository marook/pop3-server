var pop3 = require('../lib/main.js');
var should = require('should');
var socket_mock = require('./socket_mock.js');

var server_hello = '+OK pop3-server POP3-Server\r\n';

describe('create_pop_connection', function(){
    var socket_connection, pop_connection;

    beforeEach(function(){
        socket_connection = new socket_mock.SocketMock();

        pop_connection = pop3.create_pop_connection(socket_connection);

    });

    describe('CAPA', function(){
        it('should return empty feature list', function(){
            clear_server_sent_data();

            client_sends_data('CAPA\r\n');

            server_sent_data('.\r\n');
        });
    });

    describe('USER', function(){
        it('should accept username and return +OK', function(){
            clear_server_sent_data();

            client_sends_data('USER hanibal\r\n');

            server_sent_data('+OK\r\n');
        });
    });

    describe('USER and PASS', function(){
        it('should emit authentication event', function(done){
            var expected_user = 'hanibal';
            var expected_password = '42';

            pop_connection.on('authentication', function(user, password, callback){
                user.should.equal(expected_user);
                password.should.equal(expected_password);

                done();
            });

            client_sends_data('USER ' + expected_user + '\r\n');

            client_sends_data('PASS ' + expected_password + '\r\n');
        });
    });

    function client_sends_data(s){
        socket_connection.emit('data', new Buffer(s, 'ascii'));
    }

    function server_sent_data(s){
        socket_connection.written.should.equal(s);
    }

    function clear_server_sent_data(){
        socket_connection.written = '';
    }
});
