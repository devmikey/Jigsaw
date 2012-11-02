/**
 * MODULE DEPENDENCIES
 * -------------------------------------------------------------------------------------------------
 * include any modules you will use through out the file
 **/

 
var connect = require('connect');
var express = require('express');
var fs = require('fs');
var logger = require('./logger').logger();

var client = require('../client/client');
var datastore = require('./stores/datastore.js');
var interactionHandler = require('../lib/interactionHandler');
var QueueProvider = require('./stores/queueprovider-mongodb').QueueProvider;
// route specific middleware for ITK service routes
var common = [
		require('./middleware/serviceEnabled'),
		require('./middleware/soapHandler'),
		require('./middleware/jsonParser'),
		require('./middleware/soapValidator'),
		require('./middleware/verifySignature')];
		
exports.createServer = function (settings, plugins, callback) {
	var routes = new Array();
	// custom middleware needs to be pulled from config
	var custommiddleware = [];
	var pluginsFactory = {};
	
	// create a factory to manage the response handlers
	for (var i=0; i < plugins.length;i++) {
		pluginsFactory[plugins[i].name] = require(plugins[i].location);
	}
	
	// bind the routes to the response handler
	for (var i = 0; i < settings.routes.length; i++) {
		var plugin = pluginsFactory[settings.routes[i].plugin];
		routes.push(interactionHandler.create(settings.routes[i].service, 
											  settings.routes[i].description, 
											  settings.routes[i].route, 
											  settings.routes[i].invocationstyle, 
											  settings.routes[i].serviceStatus, 
											  custommiddleware, 
											  plugin.process));
	}
	var app = init(routes, settings.port);
	app.domain = settings.name;
	app.port = settings.port;
	app.routes = settings.routes;
	app.logger = logger;
	logger.log('info', 'jigsaw', {message: 'Jigsaw Host Server Initialised'});
	return callback(null, app);
}

var init = function (settings, port) {
	/* private members  */
	var soapHeader;
	var publicKey;
	var queueProvider;
	var app = module.exports = express.createServer();
	app.routeSettings = settings;
	
	app.initQueue = function (host, port, database, callback) {
		queueProvider = new QueueProvider(host, port, database, function (err) {
				console.log("unable to access the queue Provider");
				callback(err)
			});
	}
	
	/* public jigsaw methods */
	app.getClient = function () {
		return client;
	};
	
	app.getQueueProvider = function () {
		return queueProvider;
	};
	
	app.addPublicKey = function (publickey) {
		publicKey = publickey;
	}
	
	app.getPublicKey = function () {
		return publicKey;
	}
	
	app.addHeader = function (header) {
		soapHeader = header;
	}
	
	app.getHeader = function () {
		return soapHeader;
	}
	
	/**
	 * CONFIGURATION
	 * -------------------------------------------------------------------------------------------------
	 * set up any custom middleware (errorHandler), custom Validation (signatureValidator)
	 **/
	
	app.configure(function () {
		app.use(express.methodOverride());
		app.use(app.router);
	});
	
	app.configure('development', function () {
		app.use(express.errorHandler({
				dumpExceptions : true,
				showStack : true
			}));
	});
	
	app.configure('production', function () {
		app.use(express.errorHandler());
	});
	
	/**
	 * ROUTING
	 * -------------------------------------------------------------------------------------------------
	 * dynamic route loaders
	 **/
	
	// add the user defined routes

	for (var i = 0; i < settings.length; i++) {
		app.post("/" + settings[i].route, common, settings[i].custommiddleware, settings[i].process);
		settings[i].settingdescription = "started";
		logger.log('info', 'jigsawsettings', {message: settings[i].route});
	}

	
	/* global routes - these should be last */
	app.get('/403', function (req, res) {
		logger.log('info', 'jigsaw', {message: 'HTTP 403 Error = url ' + req.url});
		throw new Error('This is a 403 Error');
	});
	
	// manual 500 error
	app.get('/500', function (req, res) {
		logger.log('info', 'jigsaw', {message: 'HTTP 500 Error = url ' + req.url});
		throw new Error('This is a 500 Error');
	});
	
	// wildcard route for 404 errors
	app.get('/*', function (req, res) {
		logger.log('info', 'jigsaw', {message: 'General HTTP 403 Error = url ' + req.url});
		throw new Error("Not Found: " +req.url);
	});
	
	app.post('/*', function (req, res) {
		logger.log('info', 'jigsaw', {message: 'HTTP 403 Post Error = url ' + req.url});
		throw new Error(req.url + " Url not found");
	});
	
	// home page
	app.get('/', function (req, res) {
		res.render('index', {
			title : 'Pipecleaning Page '
		})
	});
	return app;
}

exports.interactionHandler = function () {
	return interactionHandler;
}
