/*

The processor is responsible for the following
    1. Acting on the message - i.e. saving to a database
    2. Supporting the requestException Interaction Pattern
*/

var messageResponses = require('../messages/messageResponses');

// create a function with a callback whehre you perform the main process
 var doAction = function(req, callback) {
		var msg = req.app.body.raw;
        console.log("Received processing report from OpenEyes");
		var documentid = req.app.body.json['soap:Body']['document']['id'];
		var status = req.app.body.json['soap:Body']['document']['status'];
		console.log("openEyes processed document: "+ documentid);
		console.log("Reported processed: " +status);
        return callback(null);
    }

// typical requestException Interaction
exports.process = function(req, res, callback) {
    var msg;
    try {
            doAction(req, function(err) {
                if(err == undefined) {
                }
                else {
                    // a http error should be throw here instead of a business exception
                    msg = messageResponses.simpleResponse("FAIL");
                }    
                return callback(null, msg);
            })
    }
    catch(err) {
        return callback(err);
    }
}