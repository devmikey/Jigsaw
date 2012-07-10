var messageResponses = require('../../client/messages/messageResponses');

exports.addtoqueue = function(req, res, callback) {
    try {
        var app = req.app;
        var logger = app.logger;
        logger.log('info', 'Adding item to queue', '');
        var queueProvider = app.getQueueProvider();

        queueProvider.save({ "message": app.body.json ,"raw": app.body.raw}, function(error, docs) {

            if(error != null) {
                return callback(error);
            }
            else {
                logger.log('info', 'Item saved', error);
                return "saved";
            }

        });

        return callback(null, "addtoqueue");
    }
    catch(err) {
       return callback(err);
    }
}

exports.getfromqueue = function(req, res, callback) {
    try {
        var app = req.app;
        var logger = app.logger;
        logger.log('info', 'Retrieving the next batch of messages', '');
        var queueProvider = app.getQueueProvider();
        queueProvider.findtop(1, function(error, docs) {
            if(error != null) {
                return callback(error);
            }
            else {
                return callback(null, docs[0].raw);
            }

        });
    }
    catch(err) {
        return callback(err);
    }
}

exports.removefromqueue = function(req, res, callback) {
    try {
        return callback(null, "removefromqueue");
    }
    catch(err) {
        return callback(err);
    }
}