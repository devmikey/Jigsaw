var messageResponses = require('../../messages/messageResponses');

exports.addtoqueue = function(req, res, callback) {
    try {

        var app = req.app;
        var logger = app.logger;
        var queueProvider = app.getQueueProvider();
        var soapHeader = app.getHeader();
        var messageId = soapHeader["wsa:MessageID"];
        var msg;

        queueProvider.isQueued(messageId, function(err) {
            if(err) {
                // raise a business exception don't throw an error
                msg = messageResponses.simpleResponse("FAIL:Duplicate Message ID:" + messageId + " - already in Queue");
                return callback(null, msg);
            }
            else {
                logger.log('info', 'Adding message ' + messageId + ' to queue', '');
                queueProvider.add(messageId, { "message": app.body.json, "raw": app.body.raw }, function(err) {
                    if(err) {
                        msg = messageResponses.simpleResponse("FAIL:" + err);
                    }
                    else {
                        msg = messageResponses.simpleResponse("OK");
                    }
                    return callback(null, msg);
                });
            }
        });
    }
    catch(err) {
        return callback(err);
    }
}

exports.getfromqueue = function(req, res, callback) {
    var app = req.app;
    var logger = app.logger;
    var queueProvider = app.getQueueProvider();
    var msg;
    var batch = 1; // need to extract this from the incoming request
    var maxBatch = 1; // need to pull this from the service config - at moment set max bax to same as batch
    if(batch > maxBatch) {
        batch = maxBatch;
    }

    try {
        logger.log('info', 'Retrieving the next batch of messages', '');
        queueProvider.findtop(batch, function(err, items) {
            if(err) {
                msg = messageResponses.simpleResponse("FAIL:" + err);
            }
            else {
                var collection = "<collection>";
                for(var i = 0; i < items.length; i++) {
                    collection = collection + "<item>" + items[i].data.raw + "</item>";
                }
                collection = collection + "</collection>"

                msg = messageResponses.simpleResponse(collection);
            }

            return callback(null, msg);
        });
    }
    catch(error) {
        console.log('Error: ' + error);
        return callback(error);
    }
}

exports.removefromqueue = function(req, res, callback) {
    var app = req.app;
    var logger = app.logger;
    var queueProvider = app.getQueueProvider();
    var msg;

    try {

        // need to pull this from the incoming request
        var messageId = "fbe84f08-b35a-8125-1fbd-3c66fff998e6";

        queueProvider.isQueued(messageId, function(err) {
            if(err) {
                // the item exists so can perform removal
                queueProvider.remove(messageId, function(err) {
                    if(err) {
                        // not sure when an error is triggered?
                        console.log(err);
                        msg = messageResponses.simpleResponse("FAIL:" + err);
                        return callback(null, msg)
                    }
                    else {
                        msg = messageResponses.simpleResponse("OK");
                        return callback(null, msg);
                    }
                });
            }
            else {
                msg = messageResponses.simpleResponse("FAIL: Can't find Message " + messageId + ". Unable to remove");
                return callback(null, msg);
            }
        });

    }
    catch(err) {
        return callback(err);
    }
}