/**
 * this piece of middleware places the soap message into the app.body.raw 
 * 
 **/

module.exports = function(req, res, next) {
    var soap = '';
    var app = req.app;
    var logger = app.logger;
    app.body = { "raw": "", "json": "" };

    req.on('data', function(chunk) { soap += chunk });
    req.on('end', function() {
        var err;

        if(isEmpty(soap) === true) {
            err = new Error("Soap Message must be present");
            return next(err)
        };

        app.body.raw = soap;
        logger.info('The soap handler stored the soap message');
		logger.info(soap);
        return next();
    });
};


function isEmpty(value){
    return (typeof value === "undefined" || value === null || value === '');
}