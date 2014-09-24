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

    function client_sends_data(s){
        socket_connection.emit('data', new Buffer(s, 'ascii'));
    }

    describe('CAPA', function(){
        it('should return empty feature list', function(){
            client_sends_data('CAPA\r\n');

            socket_connection.written.should.equal(server_hello + '.\r\n');
        });
    });
});
