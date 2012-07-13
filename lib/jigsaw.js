/**
* MODULE DEPENDENCIES
* -------------------------------------------------------------------------------------------------
* include any modules you will use through out the file
**/

var express = require('express')
  , connect = require('connect');

var QueueProvider = require('./stores/queueprovider-mongodb').QueueProvider;
var interactionHandler = require('../lib/interactionHandler');
var client = require('../client/client');

exports.createServer = function(routes) {
    /* private members  */
    var soapHeader;
    var publicKey;
    var queueProvider;


    var app = module.exports = express.createServer();

    app.initQueue = function(host, port, database, callback) {
        queueProvider = new QueueProvider(host, port, database, function(err) {
            callback(err)
        });      
    }

    /* public jigsaw methods */
    app.getClient = function() {
        return client;
    };

    app.getQueueProvider = function() {
        return queueProvider;
    };

    app.addPublicKey = function(publickey) {
        publicKey = publickey;
    }

    app.getPublicKey = function() {
        return publicKey;
    }

    app.addHeader = function(header) {
        soapHeader = header;
    }

    app.getHeader = function() {
        return soapHeader;
    }

    /**
    * CONFIGURATION
    * -------------------------------------------------------------------------------------------------
    * set up any custom middleware (errorHandler), custom Validation (signatureValidator)
    **/

    app.configure(function() {
        app.use(express.methodOverride());
        app.use(app.router);
    });

    app.configure('development', function() {
        app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
    });

    app.configure('production', function() {
        app.use(express.errorHandler());
    });

    /**
    * ROUTING
    * -------------------------------------------------------------------------------------------------
    * dynamic route loaders
    **/

    app.routePlugins = routes;

    // route specific middleware for ITK service routes
    var common = [
         require('./middleware/logger'),
         require('./middleware/soapHandler'),
         require('./middleware/jsonParser'),
         require('./middleware/soapValidator'),
         require('./middleware/verifySignature')];

    for(var i = 0; i < routes.length; i++) {
        app.post(routes[i].route, common, routes[i].custommiddleware, routes[i].process);
    }

    /* global routes - these should be last */
    app.get('/403', function(req, res) {
        throw new Error('This is a 403 Error');
    });

    // manual 500 error
    app.get('/500', function(req, res) {
        throw new Error('This is a 500 Error');
    });

    // wildcard route for 404 errors
    app.get('/*', function(req, res) {
        throw new Error("Not Found");
    });

    // home page
    app.get('/', function(req, res) {
        res.render('index', { title: 'Pipecleaning Page ' })
    });



    return app;
}

exports.interactionHandler = function() {
    return interactionHandler;
}
