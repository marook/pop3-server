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
            client_sends_data('CAPA\r\n');

            server_sent_data('.\r\n');
        });
    });

    describe('USER', function(){
        it('should accept username and return +OK', function(){
            client_sends_data('USER hanibal\r\n');

            server_sent_data('+OK\r\n');
        });
    });

    function client_sends_data(s){
        socket_connection.emit('data', new Buffer(s, 'ascii'));
    }

    function server_sent_data(s){
        socket_connection.written.should.equal(server_hello + s);
    }
});
