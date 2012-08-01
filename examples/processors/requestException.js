/*

The processor is responsible for the following
    1. Acting on the message - i.e. saving to a database
    2. Supporting the requestException Interaction Pattern
*/

var messageResponses = require('../../messages/messageResponses');

// create a function with a callback whehre you perform the main process
 var doAction = function(req, callback) {
        // stub
        return callback(null);
    }

// typical requestException Interaction
exports.process = function(req, res, callback) {
    var msg;
    try {
            doAction(req, function(err) {
                if(err == undefined) {
                    // the business process should respond with a simple success payload for the requestException pattern
                    msg = messageResponses.simpleResponse("OK");
                }
                else {
                    // the business process should respond with a simple failure payload for the requestException pattern
                    msg = messageResponses.simpleResponse("FAIL");
                }    

                console.log(msg)
                return callback(null, msg);
            })
    }
    catch(err) {
        return callback(err);
    }
}