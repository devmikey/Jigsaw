var winston = require('winston');
//var nssocket = require('winston-nssocket').Nssocket;

/**
 * this piece of middleware provides a logger for auditing actions
 **/

exports.logger = function() {

/*
	Here you can add as many types of logging as you want - the following examples uses web sockets
	
	winston.add(nssocket, {
	  host: 'localhost',
	  port: 9003
	});
*/

	winston.stream().on('log', function(log) {
	  console.log(log.message.message);
	});
	return winston;
};

