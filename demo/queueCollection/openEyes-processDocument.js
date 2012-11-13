/*

This is where the business logic should be triggered:
	1. Store the message in the database
	2. Send an response
*/
var messageResponses = require('../../messages/messageResponses');

// create a function with a callback where you perform the main process
 var doAction = function(req, callback) {
        /* Add your business logic here e.g.
			1. get msg
			2. store in the queue
			3. return response depending upon whether call was async or sync
		*/	
		var queueName = req.route.path;
		// 	1. get msg
		var app = req.app;
		app.QueueProvider.add(app, queueName, function(err) {
		  console.log("data added");
		  return callback(err);
	    });
		//2. save it to the database for audit purposes 
		//3. do some processing on it
		//4. decode the base 64 document
		//5. save it into the document store where the user can view it
		
        
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
        console.log("openEyes Document Processing Exception " + err)
        return callback(err);
    }
}