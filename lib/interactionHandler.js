/*

* This is responsible for implementing the ITK Interaction patterns:
    "Request Exception" which returns a simple response or an exception
*   "Request Response Exception" which returns a response or an exception
*
*   Depending on the invocation style the interaction pattern will either operate synchronously or asynchronously
*
*   Asynchronous interactions will return a http response, without a soap packet and then use the replyTo attribute to send the response to
*/

var uuid = require('node-uuid');
var messageResponses = require('../client/messages/messageResponses');
var distributionEnvelope = require('../client/messages/distributionEnvelope');

// the async response needs to be pushed out to the replyTo address
var syncHttpResponse = function(req, res, err) {
    var app = req.app;
    var logger = app.logger;
    var jrequest = app.body.json;

    var header = new Array(
            { "name": "Action", "namespace": "http://www.w3.org/2005/08/addressing", "data": jrequest["soap:Header"]["wsa:Action"] },
            { "name": "MessageID", "namespace": "http://www.w3.org/2005/08/addressing", "data": uuid.v4() },
            { "name": "RelatesTo", "namespace": "http://www.w3.org/2005/08/addressing", "data": jrequest["soap:Header"]["wsa:MessageID"] }
        );

    var msg = "";
    if(err != undefined) {
        //ITK 4.2.3 - Asynchronous Failure Scenario 2 
        msg = messageResponses.getMessage(header, messageResponses.itkError(err));
        res.writeHead(500);
        res.write(msg);
        res.end();
    }
    else {
        // ITK 4.2.1 Asynchronous Success Scenario - INCOMPLETED AT MOMENT
        res.writeHead(202, { 'Content-Type': 'text/xml' });
        res.end();
        // need to push out the response to the ReplyTo address
    }
};

// the async response needs to be pushed out to the replyTo address
var asyncResponse = function(req, res, err) {

    // need to post to the ReplyTo the response
    var app = req.app;
    var client = app.client;
    var logger = app.logger;

    var msgProperties = {
        "serviceName": "urn:nhs-itk:services:201005:SendDocument-v1-0", // should be an ack
        "key": "../certs/client.pem", // should load from certificate storeb using the friendlyName
        "properties": { "addresslist": new Array("urn:nhs-uk:addressing:ods:Y88764:G1234567"),
            "auditIdentity": new Array("urn:nhs-uk:addressing:ods:R59:oncology"),
            "manifest": [
                        { "mimetype": "application/pdf", "data": "JVBER=" }
                    ],
            "senderAddress": "urn:nhs-uk:addressing:ods:R59:oncology"
        },
        "url": "http://localhost:3001/async/clinicaldocuments",
        "handler": function(ctx) {
            logger.log("received http response code:" + ctx.statusCode);
        }
    }

    var msg = distributionEnvelope.create(msgProperties);
    client.send(msg);

};

var simpleSyncResponse = function(req, res,  err) {
    var app = req.app;
    var jrequest = app.body.json;

    var header = new Array(
            { "name": "Action", "namespace": "http://www.w3.org/2005/08/addressing", "data": jrequest["soap:Header"]["wsa:Action"] },
            { "name": "MessageID", "namespace": "http://www.w3.org/2005/08/addressing", "data": uuid.v4() },
            { "name": "RelatesTo", "namespace": "http://www.w3.org/2005/08/addressing", "data": jrequest["soap:Header"]["wsa:MessageID"] }
        );

    var msg = "";
    if(err != undefined) {
        msg = messageResponses.getMessage(header, messageResponses.itkError(err));
        res.writeHead(500);
        res.write(msg);
        res.end();
    }
    else {
        msg = messageResponses.getMessage(header, messageResponses.simpleMessageResponse());
        res.writeHead(200, { 'Content-Type': 'text/xml' });
        res.write(msg);
        res.end();
    }
};


var syncResponse = function(req, res, err) {

    var app = req.app;
    var client = app.client;
    var logger = app.logger;
    var jrequest = app.body.json;

    var header = new Array(
            { "name": "Action", "namespace": "http://www.w3.org/2005/08/addressing", "data": jrequest["soap:Header"]["wsa:Action"] },
            { "name": "MessageID", "namespace": "http://www.w3.org/2005/08/addressing", "data": uuid.v4() },
            { "name": "RelatesTo", "namespace": "http://www.w3.org/2005/08/addressing", "data": jrequest["soap:Header"]["wsa:MessageID"] }
        );

    var msg = "";
    if(err != undefined) {
        logger.log("ITK 4.1.3 Synchronous Failure Scenario 2");
        msg = messageResponses.getMessage(header, messageResponses.itkError(err));
        res.writeHead(500);
        res.write(msg);
        res.end();
    }
    else {
        logger.log("ITK 4.1.1 Synchronous Success Scenario");
        msg = messageResponses.getMessage(header, messageResponses.syncResponse());
        res.writeHead(200, { 'Content-Type': 'text/xml' });
        res.write(msg);
        res.end();
    }
};

var handler = function(interactionPattern, process) {

    this.handler = function(req, res) {
        var error;
        try {
            // if an async call then need to return a http 202 before processing
            // the process should be called on the syncHttpResponse callback
            // error is not setup? - the error should be pulled out from the middleware?
            if (interactionPattern.async === true) {
                syncHttpResponse(req, res, error);
            };

            process(req, res);
        }
        catch(err) {
            error = {
                "faultactor": req.headers['host'] + req.url,
                "id": uuid.v4(),
                "code": err.code,
                "text": err.message,
                "diagnostictext": err.diagnostictext
            }
        }
        finally {
            // return either a http 200 or a http 202 response based on the invocation style
            interactionPattern.response(req, res, error);
        }
    }

    return this.handler;
}

exports.create = function(route, pattern, custommiddleware, process) {
    var interactionPattern = getInteractionPattern(pattern);
    return {
        "route": route,
        "interactionPattern":  interactionPattern,
        "custommiddleware": custommiddleware,
        "process": handler(interactionPattern, process)
    }
}

var getInteractionPattern = function(pattern) {
    if (pattern == "requestException") {
        return {
            "async": false,
            "response": simpleSyncResponse
        }
    }

    if (pattern == "syncRequestResponseException") {
        return {
            "async": false,
            "response": syncResponse
        }
    }
    
    if (pattern == "asyncRequestResponseException") {
        return {
            "async": true,
            "response": asyncResponse
        }
    }
    
}

