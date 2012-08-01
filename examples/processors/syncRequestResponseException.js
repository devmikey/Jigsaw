/*

The processor is responsible for the following
    1. Acting on the message - i.e. saving to a database
    2. Supporting the requestResponseException Interaction Pattern in a synchronous invocation style
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
                    // define how the business process show respond in case of success
                    msg = "<document><id>12345</id></document>";
                }
                else {
                    // define how the business process show respond in case of failure
                    msg = "<document><error>didn't save</error></document>";
                }

                console.log(msg)

                return callback(null, msg);
            })
    }
    catch(err) {
        return callback(err);
    }
}