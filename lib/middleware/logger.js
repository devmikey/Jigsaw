var winston = require('winston');

/**
 * this piece of middleware provides a logger for auditing actions
 **/

module.exports = function(req, res, next) {
    var app = req.app;

    var logger = new (winston.Logger)({
        transports: [
      new (winston.transports.Console)(),
      //new (winston.transports.File)({ filename: 'logfile.log' })
    ]
    });

    app.logger = logger;

    console.log('Logger enabled');

    return next();
};
