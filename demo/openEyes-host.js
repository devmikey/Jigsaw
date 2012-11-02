/* This is the OpenEyes Host */
var jigsaw = require('../lib/jigsaw.js');

var routeConfig = {
		"name" : "testing.OpenEyes",
		"port" : "5000",
		"routes" : [{
				"service" : "clinical.documents.openehr",
				"description" : "Testing async calls between blackpear and OpenEyes",
				"route" : "openeyes/testing/clinicaldocs/openehr/async",
				"invocationstyle" : "async",
				"plugin" : "openEyes-processdocument",
				"custommiddleware" : [],
				"serviceStatus" : "started"
			},
		    {
				"service" : "clinical.documents.openehr",
				"description" : "Testing sync calls between blackpear and OpenEyes",
				"route" : "openeyes/testing/clinicaldocs/openehr/sync",
				"invocationstyle" : "sync",
				"plugin" : "openEyes-processdocument",
				"custommiddleware" : [],
				"serviceStatus" : "started"
			}
		]
	}

// the plugin handles the response logic - the pluginConfig is used to identify the appropiate handler for the response
var pluginConfig = [	
	{
		"name" : "openEyes-processdocument",
		"location" : "../demo/openEyes-processdocument.js"
	}
]
jigsaw.createServer(routeConfig, pluginConfig, function (err, app) {
	if (err != undefined) { 
		console.log("Error when creating OpenEyes Host")
		throw new Error(err);
	};
	console.log("Binding Public key to the OpenEyes Host");
	app.addPublicKey("../certs-server/server_public.pem");
	app.listen(routeConfig.port);
});