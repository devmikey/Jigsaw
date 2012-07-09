/*
* This demonstrates the server that receives an asynchronous reply from another server
* run the async-document example to send a test document to jigsaw1 which will 
* then send a http response to the async-document before sending an aysnc reply to server2
*
*/

var jigsaw = require('../lib/jigsaw.js');
var interactionHandler = require('../lib/interactionHandler');

// setup the request handler
var callback = function(req, res) {
    try {
        console.log("request received in application a");
    }
    catch(err) {
        // Any errors caught will be handled by the requestException module and a soapFault returned
        //if you wish to change the error description the
        throw err;
    }
}

// example of custom middleware - sends a udp broadcast saying a new message has been received
var testmiddleware = function(req, res, next) {
    var app = req.app;
    var msg = app.body.json;
    // send a udp broadcast saying we have a new message

    var dgram = require('dgram');
    var message = new Buffer("new-document");
    var client = dgram.createSocket("udp4");
    client.send(message, 0, message.length, 41234, "localhost", function(err, bytes) {
        console.log("sending udp update ")
        client.close();
    });


    next();
}

// Build the route paths - typically these would be loaded from a store
var custommiddleware = [testmiddleware];

var routes = new Array();
routes.push(interactionHandler.create("/async/clinicaldocuments", "requestException", [],  callback));
var app = jigsaw.createServer(routes);
app.listen(3001);