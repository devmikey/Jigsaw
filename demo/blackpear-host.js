var jigsaw = require('../lib/jigsaw.js');

/*
name: the named instance of the node host running
port: the port the host listens on
routes: used to determine paths requests are target at and how they should be handled
service: used to group related routes - for organising reporting
description: friendly description of the route
route: uri that the request is target at
invocationstyle: used to determine if an synchronous or asynchronous message pattern is being used
plugin: the plugin performs the processing of the message - this is where the business logic is called from
custommiddleware: a set of plugins can be called to perform custom logic prior to the plugin being called, e.g. extra validation
serviceStatus: allows the service to be started or stopped in order to prevent futher processing
*/

var routeConfig = {
		"name" : "testing.blackpear",
		"port" : "3001",
		"routes" : [{
				"service" : "clinical.documents.openehr",
				"description" : "Processes an async reply from openEyes",
				"route" : "blackpear/clinicaldocuments/reply",
				"invocationstyle" : "sync",
				"plugin" : "requestException",
				"custommiddleware" : [],
				"serviceStatus" : "started"
			}
		]
	}

// the plugin handles the response logic - the pluginConfig is used to identify the appropiate handler for the response
var pluginConfig = [	
	{
		"name" : "requestException",
		"location" : "../demo/blackpear-processreply.js"
	}
]

jigsaw.createServer(routeConfig, pluginConfig, function (err, app) {
	if (err != undefined) { 
		console.log("Error when creating BlackPear Host")
		throw new Error(err);
	};
	console.log("Binding Public key to the BlackPear Host");
	app.addPublicKey("../certs-server/server_public.pem");
	
	console.log("BlackPear Host running on port " + routeConfig.port);
	app.listen(routeConfig.port);
});