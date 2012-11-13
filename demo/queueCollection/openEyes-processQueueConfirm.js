/*

This is where the business logic should be triggered:
	1. Store the message in the database
	2. Send an response
*/

var messageResponses = require('../../messages/messageResponses');

// create a function with a callback where you perform the main process
 var doAction = function(req, callback) {
		var app = req.app;
		console.log("hello queue confirm msg");
		app.QueueProvider.update(app, function(err) {
		   return callback(err);
		});
	   
		console.log("Received collection confirmation from BlackPear");
    }

exports.process = function(req, res, callback) {
    var properties;
    var app = req.app;
    var soapHeader = app.getHeader();

    try {
        doAction(req, function(err) {
			if (soapHeader["wsa:ReplyTo"] == undefined) {
				console.log("this is a synchronous call");
			}
			else {
				console.log("this is a asynchronous call");
				console.log("ReplyTo " + soapHeader["wsa:ReplyTo"]["wsa:Address"])
				console.log("Action " + soapHeader["wsa:Action"]);
			}
            
            if(err == undefined) {
                // define how the business process should reply to receipt of a message in the case of success
                properties = {
                    "payload": "<document><id>"+soapHeader["wsa:MessageID"]+"</id><status>OK</status></document>",
                    "serviceProperties": {
                        "action": soapHeader["wsa:Action"]
                    },
                    "handler": function(ctx) {
                            console.log("document processor async response http header: "+ctx.statusCode)
                    }
                }
            }
            else {
                // define how the business process should reply to receipt of a message in the case of failure
                properties = {
                    "payload": "<document><id>"+soapHeader["wsa:MessageID"]+"</id><status>ERROR</status></document>",
                    "serviceProperties": {
                        "action": soapHeader["wsa:Action"]
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
        console.log("openEyes Queue Confirmation Processing Exception " + err)
        return callback(err);
    }
}