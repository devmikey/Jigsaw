/*

The processor is responsible for the following
    1. Acting on the message - i.e. saving to a database
    2. Supporting the requestResponseException Interaction Pattern in an asynchronous invocation style

*/

var messageResponses = require('../../messages/messageResponses');

// create a function with a callback whehre you perform the main process
 var doAction = function(req, callback) {
        // stub
        return callback(null);
    }

exports.process = function(req, res, callback) {
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