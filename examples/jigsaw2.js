/*
* This demonstrates the server that receives an asynchronous reply from another server
* run the async-document example to send a test document to jigsaw1 which will 
* then send a http response to the async-document before sending an aysnc reply to server2
*
*/

var jigsaw = require('../lib/jigsaw.js');
var interactionHandler = require('../lib/interactionHandler');
var messageResponses = require('../client/messages/messageResponses');

// typical requestException Interaction
var requestException = function(req, res, callback) {
    var msg = messageResponses.simpleResponse("OK");
    console.log('received an async message, sending response back '+msg)
    return callback(null, msg);
}

/**
 * this piece of middleware checks the soap properites and ensures they comply with the ITK specifications
 **/

var custommiddleware = [];
var routes = new Array();
routes.push(interactionHandler.create("/asyncreply/clinicaldocuments", "sync", custommiddleware,  requestException));
var app = jigsaw.createServer(routes);
app.addPublicKey("../certs-server/server_public.pem");
app.listen(3001);