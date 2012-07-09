var client = require('../client/client');
var distributionEnvelope = require('../client/messages/distributionEnvelope');


/* Example of implementing a Jigsaw server
*  This demonstrates how to 
*    1. Message handling in the event of failure
*/

var msgProperties = {
    "serviceName" : "urn:nhs-itk:services:201005:SendDocument-v1-0",
    "replyTo": "http://localhost:3001/asyncreply/clinicaldocuments",
    "key": "../certs/client.pem", // should load from certificate storeb using the friendlyName
    "properties": { "addresslist": new Array("urn:nhs-uk:addressing:ods:Y88764:G1234567", "urn:nhs-uk:addressing:ods:Y88764:G1111111"),
        "auditIdentity": new Array("urn:nhs-uk:addressing:ods:R59:oncology", "urn:nhs-uk:addressing:ods:R22:oncology"),
        "manifest": [
                        { "mimetype": "application/pdf", "data": "JVBERi0xLj" },
                        { "mimetype": "application/pdf", "data": "JVBERi0" }
                    ],
        "senderAddress": "urn:nhs-uk:addressing:ods:R59:oncology"
    },
    "url": "http://localhost:3000/asyncerror/clinicaldocuments",
    "handler": function(ctx) {
        console.log("received http response code:" + ctx.statusCode);
    }
}

// Want a user to be able to create their own messages to send
var msg = distributionEnvelope.create(msgProperties);
console.log('Sending test message to ' + msgProperties.url);
client.send(msg);