/* This is the BlackPear Client */
var client = require('../client/client');
var distributionEnvelope = require('../messages/distributionEnvelope');

var msgProperties = {
    "serviceName" : "urn:nhs-itk:services:201005:SendDocument-v1-0",
    "key": "../certs-client/client.pem",
    "properties": { "addresslist": new Array("urn:nhs-uk:addressing:ods:Y88764:G1234567"),
        "auditIdentity": new Array("urn:nhs-uk:addressing:ods:R59:oncology"),
        "manifest": [
                        { "mimetype": "application/pdf", "data": "pretend base 64 data" }
                    ],
        "senderAddress": "urn:nhs-uk:addressing:ods:R59:oncology"
    },
    "url": "http://localhost:5000/openeyes/testing/clinicaldocs/openehr/sync",
    "handler": function(ctx) {
        console.log("Received HTTP Response: [" + ctx.statusCode+"]");
		console.log("Received Response: [" + ctx.response+"]");
		console.log("");
    }
}

// Want a user to be able to create their own messages to send
var msg = distributionEnvelope.create(msgProperties);
client.send(msg);