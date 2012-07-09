
exports.addtoqueue = function(req, res) {
    try {
        var app = req.app;
        var logger = app.logger;
        logger.log('info', 'trying to add item to queue', '');
        var queueProvider = app.queueProvider;

        queueProvider.save({message: app.body.json}, function(error, docs) {
            logger.log('info', 'saving to db', error);
        });
    }
    catch(err) {
        throw err;
    }
}

exports.getfromqueue = function(req, res) {
    try {
        // get the next batch of messages from the queue
    }
    catch(err) {
        throw err;
    }
}

exports.removefromqueue = function(req, res) {
    try {
        // confirm which items have been succesfully removed from the queue - these can be removed from the staging area
    }
    catch(err) {
        throw err;
    }
}