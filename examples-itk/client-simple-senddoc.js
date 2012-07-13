var client = require('../client/client');
var distributionEnvelope = require('../messages/distributionEnvelope');

var msgProperties = {
    // need to extract the fully qualified certificate name
    "userName": "Damian,OU=NIC,O=CFH,L=Leeds,ST=UK,C=GB",
    "serviceName": "urn:nhs-itk:services:201005:SendDocument-v1-0",
    "key": "client.pem", // should load from certificate store using the friendlyName
    "properties": { "addresslist": new Array("urn:nhs-uk:addressing:ods:Y88764:G1234567", "urn:nhs-uk:addressing:ods:Y88764:G1111111"),
        "auditIdentity": new Array("urn:nhs-uk:addressing:ods:R59:oncology", "urn:nhs-uk:addressing:ods:R22:oncology"),
        "manifest": [
                        { "mimetype": "application/pdf", "data": "pretend base64 data =" },
                        { "mimetype": "application/pdf", "data": "pretend base64 data 2 =" }
                    ],
        "senderAddress": "urn:nhs-uk:addressing:ods:R59:oncology"
    },
    // itk toolkit needs urls appended with syncsoap or asyncsoap to help it distinguish between sync and async invocation styles
    // also uses “/ToolkitUtilities/GetMessages for queue collection
    "url": "http://localhost:4848/syncsoap",
    "handler": function(ctx) {
        console.log("http response code:" + ctx.statusCode);
        console.log("soap request : " + ctx.request);
        console.log("soap response :" + ctx.response);
    }
}

// Want a user to be able to create their own messages to send
var msg = distributionEnvelope.create(msgProperties);
client.send(msg);