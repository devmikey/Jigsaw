/*

The processor is responsible for the following
    1. Acting on the message - i.e. saving to a database
    2. Supporting the requestException Interaction Pattern
    3. Supporting the requestResponseException Interaction Pattern in a synchronous invocation style
    4. Supporting the requestException Interaction Pattern in an asynchronous invocation style

*/


var messageResponses = require('../../client/messages/messageResponses');

// create a function with a callback whehre you perform the main process
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

                console.log(msg)
                return callback(null, msg);
            })
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
                    msg = "<document><id>12345</id></document>";
                }
                else {
                    // define how the business process show respond in case of failure
                    msg = "<document><error>didn't save</error></document>";
                }

                console.log(msg)

                return callback(null, msg);
            })
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
                    "payload": "<document><id>12345</id></document>",
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
                    "payload": "<document><error>failed to save</error></document>",
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