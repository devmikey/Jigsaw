var soapTests = require('../../tests/soap');
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
			logger.log('info', 'itkevents', {message: 'The soap Envelope passed validation'});
			return next();
        }
        else {
			logger.log('info', 'itkevents', {message: 'The soap Envelope failed validation'});
            err = new Error("The soap Envelope is not valid");
            return next(err);
        }

    });

   
};