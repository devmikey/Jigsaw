var soapTests = require('../../tests/validatesoap');
/**
 * this piece of middleware checks the soap properites and ensures they comply with the ITK specifications
 **/

module.exports = function(req, res, next) {
    var app = req.app;
    var logger = app.logger;
    var msg = app.body.json;

    // need to look at some of the test modules like vows
    soapTests.validate(logger, msg, function(results) {
        if(results.honored == results.total) {
            logger.info('The message complies with the ITK specifications');
        }
        else {
            logger.info('The message does not comply with the ITK specifications');
            err = new Error("The message does not comply with the ITK specifications");
            return next(err);
        }

    });

    return next();
};