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

    describe('STAT', function(){
        it('should emit stat event', function(done){
            var expected_number_of_messages = 42;
            var expected_overall_size = 100000;

            clear_server_sent_data();

            pop_connection.on('stat', function(callback){
                callback(expected_number_of_messages, expected_overall_size);

                setTimeout(function(){
                    server_sent_data('+OK ' + expected_number_of_messages + ' ' + expected_overall_size + '\r\n');

                    done();
                }, 0);
            });

            client_sends_data('STAT\r\n');
        });
    });

    describe('QUIT', function(){
        it('should emit quit event', function(done){
            pop_connection.on('quit', function(){
                done();
            });

            client_sends_data('QUIT\r\n');
        });
    });

    describe('UIDL', function(){
        it('should emit uidl event when sent without filter', function(done){
            pop_connection.on('uidl', function(filter_index){
                should(filter_index).be.null;

                done();
            });

            client_sends_data('UIDL\r\n');
        });

        it('should emit uild event with sent with filter', function(done){
            pop_connection.on('uidl', function(filter_index){
                filter_index.should.equal('42');

                done();
            });

            client_sends_data('UIDL 42\r\n');
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
