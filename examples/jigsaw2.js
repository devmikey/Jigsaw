/*
* This demonstrates the server that receives an asynchronous reply from another server
* run the async-document example to send a test document to jigsaw1 which will 
* then send a http response to the async-document before sending an aysnc reply to server2
*
*/

var jigsaw = require('../lib/jigsaw.js');
var interactionHandler = require('../lib/interactionHandler');
var messageResponses = require('../messages/messageResponses');

// in response to an async call a http 200 message should be returned
var httpResponse = function(req, res, callback) {
    // if an error occurs on processing the incoming message then throw an error otherwise no data sent back
    return callback(null);
}

/**
 * this piece of middleware checks the soap properites and ensures they comply with the ITK specifications
 **/

var custommiddleware = [];
var routes = new Array();
routes.push(interactionHandler.create("/asyncreply/clinicaldocuments", "sync", custommiddleware,  httpResponse));
var app = jigsaw.createServer(routes);
app.addPublicKey("../certs-server/server_public.pem");
app.listen(3001);