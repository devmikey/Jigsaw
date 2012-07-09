var report = require("vows/lib/vows/reporters/spec");
var vows = require('vows');
var assert = require('assert');

exports.validate = function(logger, msg, callback) {
    vows.describe('Soap Validation').addBatch({
        'Root': {
            topic: msg,
            'Has a soap namespace attribute': function(o) {
                assert.equal(o["xmlns:soap"], "http://schemas.xmlsoap.org/soap/envelope/");
            },
            'Has an itk namespace attribute': function(o) {
                assert.equal(o["xmlns:itk"], "urn:nhs-itk:ns:201005");
            },
            'Has a wsa namespace attribute': function(o) {
                assert.equal(o["xmlns:wsa"], "http://www.w3.org/2005/08/addressing");
            },
            'Has a xmlns namespace attribute': function(o) {
                assert.equal(o["xmlns:wsu"], "http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-utility-1.0.xsd");
            }
        },
        'soap:Header': {
            topic: msg["soap:Header"],
            'Has an "Action" attribute': function(o) {
                assert.equal(o["wsa:Action"].substring(0, 21), "urn:nhs-itk:services:");
            },
            'Has a "To" attribute': function(o) {
                assert.notEqual(o["wsa:Action"], undefined);
            },
            'Has a "MessageID" attribute': function(o) {
                assert.notEqual(o["wsa:MessageID"], undefined);
            }
        },
        'wsse:Security': {
            topic: msg["soap:Header"]["wsse:Security"],
            'Has an "xmlns:wsse" attribute': function(o) {
                assert.equal(o["xmlns:wsse"], "http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd");
            },
            'Has a namespace in "TimeStamp" element': function(o) {
                assert.equal(o["wsu:Timestamp"]["xmlns:wsu"], "http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-utility-1.0.xsd");
            },
            'Has an "Id" attribute': function(o) {
                assert.notEqual(o["wsu:Timestamp"]["wsu:Id"], undefined);
            },
            'Has an "wsu:Created" attribute': function(o) {
                assert.notEqual(o["wsu:Timestamp"]["wsu:Created"], undefined);
            },
            'Has an "wsu:Expires" attribute': function(o) {
                assert.notEqual(o["wsu:Timestamp"]["wsu:Expires"], undefined);
            },
            'Has a "wsse:UserNameToken" element': function(o) {
                assert.notEqual(o["wsse:UsernameToken"], undefined);
            },
            'Has a "wsse:Username" element': function(o) {
                assert.notEqual(o["wsse:UsernameToken"]["wsse:Username"], undefined);
            }
        },
        'soap:Body': {
            topic: msg["soap:Body"],
            'namespace valid': function(o) {
                assert.equal(o["xmlns:wsu"], "http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-utility-1.0.xsd");
            },
            'id is valid': function(o) {
                assert.notEqual(o["wsu:Id"], undefined);
            }
        },
        'itk:DistributionEnvelope': {
            topic: msg["soap:Body"]["itk:DistributionEnvelope"],
            'The schema namespace is present': function(o) {
                assert.equal(o["xmlns:xsi"], "http://www.w3.org/2001/XMLSchema-instance");
            },
            'The ITK namespace is present': function(o) {
                assert.equal(o["xmlns:itk"], "urn:nhs-itk:ns:201005");
            },
            'The service is present': function(o) {
                assert.notEqual(o["itk:header"].service, undefined);
            },
            'The trackingid is present': function(o) {
                assert.notEqual(o["itk:header"].trackingid, undefined);
            },
            'The addressList collection is not empty': function(o) {
                assert.notEqual(o["itk:header"]["itk:addresslist"]["itk:address"].length, 0);
            },
            'The auditIdentity collection is not empty': function(o) {
                assert.notEqual(o["itk:header"]["itk:auditIdentity"]["itk:id"].length, 0);
            },
            'The itk manifest collection is not empty': function(o) {
                assert.notEqual(o["itk:header"]["itk:manifest"]["itk:manifestitem"].length, 0);
            },
            'The itk manifest count equals the manifestitems': function(o) {
                assert.equal(o["itk:header"]["itk:manifest"].count, o["itk:header"]["itk:manifest"]["itk:manifestitem"].length);
            },
            'The itk senderAddress is not empty': function(o) {
                assert.notEqual(o["itk:header"]["itk:senderAddress"].uri, undefined);
            },
            'The itk handlingSpecification collection is not empty': function(o) {
                assert.notEqual(o["itk:header"]["itk:handlingSpecification"]["itk:spec"].length, 0);
            },
            'The itk payload collection is not empty': function(o) {
                assert.notEqual(o["itk:payloads"]["itk:payload"].length, 0);
            },
            'The itk payload count equals the number of payloads': function(o) {
                assert.equal(o["itk:payloads"].count, o["itk:payloads"]["itk:payload"].length);
            },
            'The itk payload collection count is the same as the manifest count': function(o) {
                assert.equal(o["itk:payloads"].count, o["itk:header"]["itk:manifest"].count);
            }
        }
    }).run({ }, callback);
}

//.run({ reporter: report }, callback); 