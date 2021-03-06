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
	
	var pluginsFactory = {};
	
	// create a factory to manage the response handlers
	for (var i=0; i < plugins.length;i++) {
		pluginsFactory[plugins[i].name] = require(plugins[i].location);
	}
	
	// bind the routes to the response handler
	for (var i = 0; i < settings.routes.length; i++) {
		var custommiddleware = [];
	    for (var loop=0; loop < settings.routes[i].custommiddleware.length; loop++) {
			logger.log('info', 'jigsaw', {message: 'Loading custom Middleware: ' +settings.routes[i].custommiddleware[loop]});
			custommiddleware[loop] = require(settings.routes[i].custommiddleware[loop]);
		}
	
		var plugin = pluginsFactory[settings.routes[i].plugin];
		routes.push(interactionHandler.create(settings.routes[i].service, 
											  settings.routes[i].description, 
											  settings.routes[i].route, 
											  settings.routes[i].invocationstyle, 
											  settings.routes[i].serviceStatus, 
											  custommiddleware, 
											  plugin.process));
	}
	var app = init(routes, settings);
	app.domain = settings.name;
	app.port = settings.port;
	app.routes = settings.routes;
	app.logger = logger;
	logger.log('info', 'jigsaw', {message: 'Jigsaw Host Server Initialised'});
	return callback(null, app);
}

var init = function (routes, settings) {
	/* private members  */
	var soapHeader;
	var publicKey;
	var app = module.exports = express();
	app.routeSettings = routes;
	
	if (settings.queueProvider) {
		app.QueueProvider = require(settings.queueProvider);	
	}
	
	/* public jigsaw methods */
	app.getClient = function () {
		return client;
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

	for (var i = 0; i < routes.length; i++) {
		app.post("/" + routes[i].route, common, routes[i].custommiddleware, routes[i].process);
		routes[i].settingdescription = "started";
		logger.log('info', 'jigsawsettings', {message: routes[i].route});
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
