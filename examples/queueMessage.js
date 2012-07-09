var client = require('../client/client');
/* not sure what this should be wrapped as? */
var distributionEnvelope = require('../client/messages/distributionEnvelope');

/* This example demonstrates how to send a message to the queue

* Invocation Style   : Sync
* Interaction Pattern: Request\Response\Exception

* The manifest holds the QueueMessage message
*/

var queueMsg = "sample message";

var msgProperties = {
    "serviceName" : "urn:nhs-itk:services:201005:QueueMessage",
    "serviceProperties": {
        "ns": "urn:nhs-itk:ns:201005",
        "nsprefix": "itk",
        "handlingSpecification": [
                        { "key": "urn:nhs-itk:ns:201005:ackrequested", "value": "true" }
                       ,{ "key": "urn:nhs-itk:ns:201005:interaction", "value": "XXXXXXXXXXXXXXXx" }
                    ],
        "action": "urn:nhs-itk:services:201005:QueueMessage"
    },
    "key": "../certs/client.pem", // should load from certificate store using the friendlyName
    "properties": { "addresslist": new Array("urn:nhs-uk:addressing:ods:devmikey:receiverid", "urn:nhs-uk:addressing:ods:devmikey:receiverid2"),
        "auditIdentity": new Array("urn:nhs-uk:addressing:ods:devmikey:myid", "urn:nhs-uk:addressing:ods:devmikey:myid2"),
        "manifest": [
                        { "mimetype": "text/xml", "data": queueMsg }
                       ,{ "mimetype": "text/xml", "data": queueMsg }
                    ],
        "senderAddress": "urn:nhs-uk:addressing:ods:devmikey:senderid"
    },
    "url": "http://localhost:3000/queue/queuemessage",
    "handler": function(ctx) {
        console.log("http response code:" + ctx.statusCode);
        console.log("soap:" + ctx.response);
    }
}

// Want a user to be able to create their own messages to send
var msg = distributionEnvelope.create(msgProperties);
client.send(msg);