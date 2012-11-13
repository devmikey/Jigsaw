var distributionEnvelopeTests = require('../../tests/distributionEnvelope');
/**
 * this piece of middleware checks the distributionEnvelope properites and ensures they comply with the ITK specifications
 **/

module.exports = function(req, res, next) {
    var app = req.app;
    var logger = app.logger;
    var msg = app.body.json;

    // need to look at some of the test modules like vows
    distributionEnvelopeTests.validate(logger, msg, function(results) {
        if(results.honored == results.total) {
			logger.log('info', 'itkevents', {message: 'The distributionEnvelope passed validation'});
			return next();
        }
        else {
			logger.log('info', 'itkevents', {message: 'The distributionEnvelope failed validation'});
            err = new Error("The distributionEnvelope is not valid");
            return next(err);
        }

    });

   
};