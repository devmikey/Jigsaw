/*

The processor is responsible for the following
    1. Acting on the message - i.e. saving to a database
    2. Supporting the requestException Interaction Pattern
    3. Supporting the requestResponseException Interaction Pattern in a synchronous invocation style
    4. Supporting the requestException Interaction Pattern in an asynchronous invocation style

*/


var messageResponses = require('../../client/messages/messageResponses');

 var doAction = function(req, callback) {
        // stub
        return callback(null);
    }

// typical requestException Interaction
exports.requestException = function(req, res, callback) {
    var msg;
    try {
            doAction(req, function(err) {
                if(err == undefined) {
                    // the business process should respond with a simple success payload for the requestException pattern
                    msg = messageResponses.simpleResponse("OK");
                }
                else {
                    // the business process should respond with a simple failure payload for the requestException pattern
                    msg = messageResponses.simpleResponse("FAIL");
                }
        })
        return callback(null, msg);
    }
    catch(err) {
        return callback(err);
    }
}

// typical requestException Interaction
exports.syncRequestResponseException = function(req, res, callback) {
    var msg;
    try {
            doAction(req, function(err) {
                if(err == undefined) {
                    // define how the business process show respond in case of success
                    msg = messageResponses.response("<document><id>12345</id></document>");
                }
                else {
                    // define how the business process show respond in case of failure
                    msg = messageResponses.response("<document><error>didn't save</error></document>");
                }
        })
        return callback(null, msg);
    }
    catch(err) {
        return callback(err);
    }
}

exports.asyncRequestResponseException = function(req, res, callback) {
    var properties;
    var app = req.app;
    var soapHeader = app.getHeader();

    try {
        doAction(req, function(err) {
            console.log("sending an async response to " + soapHeader["wsa:ReplyTo"]['wsa:Address'])
            if(err == undefined) {
                // define how the business process should reply to receipt of a message in the case of success
                properties = {
                    "key": "../certs-server/server.pem",
                    "payload": "<document><id>12345</id></document>",
                    "url": soapHeader["wsa:ReplyTo"]['wsa:Address'],
                    "references": new Array("Body", "Timestamp"),
                    "serviceProperties": {
                        "action": "urn:nhs-itk:services:201005:SendDocument-v1-0"
                    },
                    "handler": function(ctx) {
                            console.log("document processor async response http header: "+ctx.statusCode)
                    }
                }

            }
            else {
                // define how the business process show reply to receipt of a message in the case of failure
                properties = {
                    "key": "../certs-server/server.pem",
                    "payload": "<document><error>failed to save</error></document>",
                    "url": soapHeader["wsa:ReplyTo"]['wsa:Address'],
                    "references": new Array("Body", "Timestamp"),
                    "serviceProperties": {
                        "action": "urn:nhs-itk:services:201005:SendDocument-v1-0"
                    },
                    "handler": function(ctx) {
                            console.log("document processor async response http header: "+ctx.statusCode)
                    }
                }
            }

            return callback(null, properties);
        })

    }
    catch(err) {
        console.log("asyncRequestResponseException Exception " + err)
        return callback(err);
    }
}