/*

This is where the business logic should be triggered:
	1. Store the message in the database
	2. Send an response
*/
var Dom = require('xmldom').DOMParser;
var select = require('xml-crypto').xpath.SelectNodes;
	
var messageResponses = require('../../messages/messageResponses');

// create a function with a callback where you perform the main process
 var doAction = function(req, callback) {
        /* Add your business logic here e.g.
			1. get msg
			2. store in the queue
			3. return response depending upon whether call was async or sync
		*/	
		// 	1. get msg
		var app = req.app;
		app.QueueProvider.getBatch(app, function(items, err) {
		  return callback(items, err);
	    });
    }

// ITK Additional Module Requirements 2.2.2 Get Messages - Response
var getbatchResponse = function(items) {
    var msg = new Array();
    msg.push('<itk:QueueMessageResponse xmlns:itk="urn:nhs-itk:ns:201005" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">');
    msg.push(util.format('<itk:MessageCount>%s</itk:MessageCount>',items.length));
    for(var i = 0; i<items.length; i++){
	    // TODO need to work out the serviceMessageType correctly 
        msg.push(util.format('<itk:ServiceMessageType>%s</itk:ServiceMessageType>', 'urn:nhs-itk:services:201005:SendDocument-v1-0'));
        msg.push(util.format('<itk:MessageHandle>%s</itk:MessageHandle>',items[i].messageId));
        // only relevant if the message was an async message
		if (items.RelatesTo){
            msg.push(util.format('<itk:RelatesTo>%s</itk:RelatesTo>',items[i].RelatesTo));    
        }
		// The message soap:Body
		var doc = new Dom().parseFromString(items[i].message);
		var body = select(doc, "/*/*[local-name(.)='Body']");
        msg.push(util.format('<itk:MessagePayload>%s</itk:MessagePayload>', body));
    }
    msg.push('</itk:QueueMessageResponse>');
    return msg.join('');
}

	
exports.process = function(req, res, callback) {
    var properties;
    var app = req.app;
    var soapHeader = app.getHeader();

    try {
        doAction(req, function(items, err) {
			if (soapHeader["wsa:ReplyTo"] == undefined) {
				console.log("this is a synchronous call");
			}
			else {
				console.log("this is a asynchronous call");
				console.log("ReplyTo " + soapHeader["wsa:ReplyTo"]["wsa:Address"])
				console.log("Action " + soapHeader["wsa:Action"]);
			}
            
            if(err == undefined) {
                properties = {
                    "payload": getbatchResponse(items),
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
                    "payload": "<collection><id>"+soapHeader["wsa:MessageID"]+"</id><status>ERROR</status></collection>",
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