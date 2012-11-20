/* This is the BlackPear Client */
var client = require('../client/client');
var distributionEnvelope = require('../messages/distributionEnvelope');
var fs = require('fs');
msg = fs.readFileSync('clinical.txt', 'utf8');	

var msgProperties = {
    "serviceName" : "urn:nhs-itk:services:201005:SendCDADocument-v1-0",
    "key": "../certs-client/migcert.pem",
    "properties" : { 
		"addresslist": null,
        "auditIdentity": null,
        "manifest": [
                        { "mimetype": "text/xml", "data": msg}
                    ],
        "senderAddress": null
    },
    "url": "https://79.125.10.103:8443/SendCDADocument-v1-0",
    "handler": function(ctx) {
        console.log("Received HTTP Response: [" + ctx.statusCode+"]");
		console.log("Received Response: [" + ctx.response+"]");
		console.log("Sent Request: [" + ctx.request+"]");
		console.log("");
    }
}

// Want a user to be able to create their own messages to send
var msg = distributionEnvelope.create(msgProperties);
client.send(msg);