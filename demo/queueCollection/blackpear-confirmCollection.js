var client = require('../../client/client');
/* not sure what this should be wrapped as? */
var queue = require('../../messages/queue');

/* This example demonstrates how to confirm that a message has been retrieved from the queue */

var items = new Array("item1", "item2")

var msgProperties = {
	"receivedItems" : new Array("item1", "item2"),
	"queueName" : "openeyes/testing/queue/confirm",
    "serviceName" : "urn:nhs-itk:services:201005:QueueMessage",
    "serviceProperties": {
        "ns": "urn:nhs-itk:ns:201005",
        "nsprefix": "itk",
        "handlingSpecification": [
                        { "key": "urn:nhs-itk:ns:201005:ackrequested", "value": "true" }
                       ,{ "key": "urn:nhs-itk:ns:201005:interaction", "value": "XXXXXXXXXXXXXXXx" }
                    ],
        "action": "urn:nhs-itk:services:201005:Confirmcollection"
    },
    "key": "../../certs-client/client.pem", // should load from certificate store using the friendlyName
    "properties": { "addresslist": new Array("urn:nhs-uk:addressing:ods:devmikey:receiverid"),
        "auditIdentity": new Array("urn:nhs-uk:addressing:ods:devmikey:myid"),
        "senderAddress": "urn:nhs-uk:addressing:ods:devmikey:senderid"
    },
    "url": "http://localhost:5000/openeyes/testing/queue/confirm",
    "handler": function(ctx) {
        console.log("http response code:" + ctx.statusCode);
        console.log("soap:" + ctx.response);
    }
}

// Want a user to be able to create their own messages to send
var msg = queue.confirmation(msgProperties);
client.send(msg);