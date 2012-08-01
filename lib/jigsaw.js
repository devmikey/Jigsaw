/**
 * MODULE DEPENDENCIES
 * -------------------------------------------------------------------------------------------------
 * include any modules you will use through out the file
 **/

 
var connect = require('connect');
var express = require('express');
var fs = require('fs');
var logger = require('./logger').logger();

var QueueProvider = require('./stores/queueprovider-mongodb').QueueProvider;
var interactionHandler = require('../lib/interactionHandler');
var client = require('../client/client');
var datastore = require('../../spanners/lib/datastore.js');

var loadSettings = function (filename, callback) {
	// route specific middleware for ITK service routes
	logger.log('info', 'jigsaw ', {message: 'loading settings'});
	
	try {
			datastore.loadSettings(filename, function (err, settings) {
				if (err != undefined) {
					callback(err);
				} else {
					callback(null, settings);
				}
			});
		} catch (err) {
			logger.log('error', 'jigsaw ', {error: err});
			callback(err);
		}
}

var loadPlugins = function (filename, callback) {
	fs.readFile(filename, function (err, data) {
		if (err) {
			if (err.errno === process.ENOENT) {
				// Ignore file not found errors and return an empty result
				callback(null, "");
			} else {
				// Pass other errors through as is
				callback(err);
			}
		} else {
			// Pass successes through as it too.
			callback(null, JSON.parse(data));
		}
	})
}

var restart = function (req, res, callback) {
	var app = req.app;
	var logger = app.logger;
	
	// route specific middleware for ITK service routes
	var common = [
		require('./middleware/serviceEnabled'),
		require('./middleware/soapHandler'),
		require('./middleware/jsonParser'),
		require('./middleware/soapValidator'),
		require('./middleware/verifySignature')];
	
	logger.log('info', 'jigsaw ', {message: 'restarting services'});
	try {
		var plugins = app.routePlugins;
		var pluginIdx = -1;
		
		function getIndex(route) {
			for (var idx = 0; idx < plugins.length; idx++) {
				if (route == plugins[idx].route) {
					return idx;
				}
			}
			return -1;
		}
		
		datastore.loadSettings(settingsFile, function (err, settings) {
			if (err != undefined) {
				callback(err);
			} else {
				for (var i = 0; i < settings.length; i++) {
					pluginIdx = getIndex(settings.route);
					if (pluginIdx == -1) {
						// new plugin so need to add route
						logger.log('info', 'jigsaw ', {message: 'loading new route ' + settings[i].route});
						app.post("/" + settings[i].route, common, settings[i].custommiddleware, settings[i].process);
					} else {
						// dymanically load the processor
						processor = require('./examples/processors/documentProcessor').requestException;
						plugins[i] = interactionHandler.create(settings.service,
								settings.description,
								settings.route,
								settings.interactionstyle,
								settings.custommiddleware,
								processor);
					}
				}
				
				callback(null);
			}
			
		});
		
	} catch (err) {
		logger.log('error', 'jigsaw ', {error: err});
		callback(err);
	}
}

exports.createServer = function (settingsFile, pluginFile, callback) {
	var routes = new Array();
	// custom middleware needs to be pulled from config
	var custommiddleware = [];
	
	loadPlugins(pluginFile, function (err, pluginconfig) {
		// if err throw an error and abort
		var plugins = {};
		if (err != undefined) {
			return callback(new Error(err));
		}
		
		// dynamically load all the available plugins first
		for (var i in pluginconfig) {
			plugins[pluginconfig[i].name] = require(pluginconfig[i].location);
		}
		
		loadSettings(settingsFile, function (error, settings) {
			
			if (error != undefined) {
				return callback(new Error(error));
			}
			
			for (var i = 0; i < settings.length; i++) {
				var plugin = plugins[settings[i].plugin];
				routes.push(interactionHandler.create(settings[i].service, settings[i].description, settings[i].route, settings[i].invocationstyle, settings[i].serviceStatus, custommiddleware, plugin.process));
			}
			
			var app = init(routes);
			app.logger = logger;
			logger.log('info', 'jigsaw ', {message: 'Jigsaw Initialised'});
			app.settingsFile = settingsFile;
			app.pluginFile = pluginFile;
			return callback(null, app);
		});
		
	});
	
}

var init = function (settings) {
	/* private members  */
	var soapHeader;
	var publicKey;
	var queueProvider;
	var common = [
		require('./middleware/serviceEnabled'),
		require('./middleware/soapHandler'),
		require('./middleware/jsonParser'),
		require('./middleware/soapValidator'),
		require('./middleware/verifySignature')];
	
	var app = module.exports = express.createServer();
	app.routeSettings = settings;
	
	app.initQueue = function (host, port, database, callback) {
		queueProvider = new QueueProvider(host, port, database, function (err) {
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
	
	// this route will handle the jigsaw restart
	app.get('/jigsaw/services', function (req, res) {
		var app = req.app;
		var settingsFile = app.settingsFile;
		datastore.loadSettings(settingsFile, function(err, data) {
			if (err != undefined ) {
				res.writeHead(500, { 'Content-Type': 'application/json' });
				res.write(err);
				res.end();
			}
			else {
				res.writeHead(200, { 'Content-Type': 'application/json' });
				res.write(JSON.stringify(data));
				res.end();		
			}
			
		});
	});
	
	app.post('/jigsaw/services/add', function(req, res) {
		logger.log('info', 'jigsaw ', {message: 'new service added'});
		// need to validate first
		// post onto the appropriate jigsaw server
		// return a valid response
		var data = "";
		var app = req.app;
		var settingsFile = app.settingsFile;
		
		req.on('data', function (chunk) {
			data = data + chunk;
		});

		req.on('end', function (chunk) {
			// add the settings
			datastore.addRoute(data, settingsFile, function(err, data) {
				if (err != undefined ) {
					res.writeHead(500, { 'Content-Type': 'application/json' });
					res.write(JSON.stringify(err));
					res.end();
				}
				else {
					//restart(req,res);
					res.writeHead(200, { 'Content-Type': 'application/json' });
					res.write(JSON.stringify(data));
					res.end();		
				}	
			});
		});
	});
	
	
	app.get('/jigsaw/services/delete/*', function (req, res) {
		var app = req.app;
		var settingsFile = app.settingsFile;
		datastore.removeRoute(req.params[0], settingsFile,  function(err, data) {
			if (err != undefined ) {
				res.writeHead(500, { 'Content-Type': 'application/json' });
				res.write(JSON.stringify(err));
				res.end();
			}
			else {
				res.writeHead(200, { 'Content-Type': 'application/json' });
				res.write(JSON.stringify(data));
				res.end();		
			}	
		});
	});
	
	app.get('/jigsaw/services/disable/*', function(req, res) {
		logger.log('info', 'jigsaw ', {message: 'Jigsaw is disabling service ' + req.params[0]});
		var app = req.app;
		var settingsFile = app.settingsFile;
		
		datastore.setStatus("stopped", req.params[0], settingsFile, function(err, data) {
			if (err != undefined ) {
				res.writeHead(500, { 'Content-Type': 'application/json' });
				res.write(JSON.stringify(err));
				res.end();
			}
			else {
				app.routeSettings = data;
				res.writeHead(200, { 'Content-Type': 'application/json' });
				res.write(JSON.stringify(data));
				res.end();		
			}	
		});

	});
	
	app.get('/jigsaw/services/enable/*', function(req, res) {
			logger.log('info', 'jigsaw ', {message: 'Jigsaw is enabling service ' + req.params[0]});
			var app = req.app;
			var settingsFile = app.settingsFile;
		
			datastore.setStatus("started", req.params[0], settingsFile, function(err, data) {
			if (err != undefined ) {
				res.writeHead(500, { 'Content-Type': 'application/json' });
				res.write(JSON.stringify(err));
				res.end();
			}
			else {
				app.routeSettings = data;
				res.writeHead(200, { 'Content-Type': 'application/json' });
				res.write(JSON.stringify(data));
				res.end();		
			}	
		});
		
	});
	
	// this route will handle the jigsaw restart
	app.get('/jigsaw/restart', function (req, res) {
		restart(req, res, function (err) {
			// when restarted respond
		});
	});
	
	// add the user defined routes
	for (var i = 0; i < settings.length; i++) {
		app.post("/" + settings[i].route, common, settings[i].custommiddleware, settings[i].process);
		logger.log('info', 'jigsaw ', {message: '/' + settings[i].route + ' status = ' + settings[i].serviceStatus});
	}
	
	/* global routes - these should be last */
	app.get('/403', function (req, res) {
		throw new Error('This is a 403 Error');
	});
	
	// manual 500 error
	app.get('/500', function (req, res) {
		throw new Error('This is a 500 Error');
	});
	
	// wildcard route for 404 errors
	app.get('/*', function (req, res) {
	
		throw new Error("Not Found: " +req.url);
	});
	
	app.post('/*', function (req, res) {
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
