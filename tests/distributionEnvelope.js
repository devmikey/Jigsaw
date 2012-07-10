var report = require("vows/lib/vows/reporters/spec");
var vows = require('vows');
var assert = require('assert');

exports.validate = function(logger, msg, callback) {
    vows.describe('Distribution Envelope Validation').addBatch({
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