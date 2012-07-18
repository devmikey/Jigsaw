/* Example of implementing a Jigsaw server
*  
* This demonstrates configuring a jigsaw server to support ITK services
*/

var jigsaw = require('../lib/jigsaw.js');
var documentProcessor = require('./processors/documentProcessor');
var queueProcessor = require('./processors/queueProcessor');    
var interactionHandler = require('../lib/interactionHandler');

var distributionEnvelopeTests = require('../tests/distributionEnvelope');

// payload middleware test

var testPayload = function(req, res, next) {
    var app = req.app;
    var logger = app.logger;
    var msg = app.body.json;

    // need to look at some of the test modules like vows
    distributionEnvelopeTests.validate(logger, msg, function(results) {
        if(results.honored == results.total) {
            logger.info('The Distribution Envelope is valid');
        }
        else {
            logger.info('The Distribution Envelope is not valid');
            err = new Error("The Distribution Envelope is not valid");
            return next(err);
        }

    });

    return next();
};

// Build the route paths - typically these would be loaded from a store
var custommiddleware = [];

var routes = new Array();

/* The clinical document service in this example is configured as follows:
*
*    /sync/clinicaldocuments - sync invocation style using the request exception interaction pattern
*    /async/clinicaldocuments - async invocation style using the request response exception interaction pattern
*
*    No middleware in this queue collection service
*/

routes.push(interactionHandler.create("/simple/clinicaldocuments", "sync", custommiddleware, documentProcessor.requestException));
routes.push(interactionHandler.create("/sync/clinicaldocuments", "sync", custommiddleware, documentProcessor.syncRequestResponseException));
routes.push(interactionHandler.create("/async/clinicaldocuments", "async", custommiddleware, documentProcessor.asyncRequestResponseException));

/* The queue collection service in this example is configured as follows:
*
*    all routes use the sync invocation with the request response exception interaction pattern
*    No middleware used for the queue collection service
*/

routes.push(interactionHandler.create("/queue/queuemessage", "sync", [], queueProcessor.addtoqueue));
routes.push(interactionHandler.create("/queue/retrievebatch", "sync", [], queueProcessor.getfromqueue));
routes.push(interactionHandler.create("/queue/confirmcollection", "sync", [], queueProcessor.removefromqueue));


// pass the routes paths in and get an instance of a jigsaw server
var app = jigsaw.createServer(routes);
app.addPublicKey("./certs-server/server_public.pem");

//app.initQueue("staff.mongohq.com", 10063, "nodejitsudb451731216781", function(err){
/*
app.initQueue("localhost", 27017, "jigsaw", function(err){
    // start listening for messages once queue initialised
    app.listen(3000);   
});
*/
console.log("jigsaw running on http://localhost:3000");
app.listen(3000);   
