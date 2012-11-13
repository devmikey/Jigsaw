/* This is the OpenEyes Host */
var jigsaw = require('../../lib/jigsaw.js');

var routeConfig = {
		"name" : "testing.OpenEyes",
		"port" : "5000",
		"queueProvider" : "../lib/stores/queueprovider-mysql",
		"routes" : [{
				"service" : "clinical.documents.openehr",
				"description" : "Testing async calls sent by blackpear are placed in an Queue for OpenEyes",
				"route" : "openeyes/testing/clinicaldocs/openehr/async",
				"invocationstyle" : "async",
				"plugin" : "openEyes-queuedocument",
				"custommiddleware" : ['../lib/middleware/distributionValidator'],
				"serviceStatus" : "started"
			},
		    {
				"service" : "clinical.documents.openehr",
				"description" : "Testing sync calls sent by blackpear are placed in an Queue for OpenEyes",
				"route" : "openeyes/testing/clinicaldocs/openehr/sync",
				"invocationstyle" : "sync",
				"plugin" : "openEyes-queuedocument",
				"custommiddleware" : ['../lib/middleware/distributionValidator'],
				"serviceStatus" : "started"
			},
			{
				"service" : "urn:nhs-itk:services:201005:QueueMessage",
				"description" : "Testing sync calls sent by blackpear are placed in an Queue for OpenEyes",
				"route" : "openeyes/testing/queue/confirm",
				"invocationstyle" : "sync",
				"plugin" : "openEyes-processQueueConfirm",
				"custommiddleware" : [],
				"serviceStatus" : "started"
			},
			{
				"service" : "urn:nhs-itk:services:201005:QueueMessage",
				"description" : "Testing sync calls sent by blackpear are placed in an Queue for OpenEyes",
				"route" : "openeyes/testing/queue/retrieve",
				"invocationstyle" : "sync",
				"plugin" : "openEyes-queueretrieve",
				"custommiddleware" : [],
				"serviceStatus" : "started"
			}
		]
	}

// the plugin handles the response logic - the pluginConfig is used to identify the appropiate handler for the response
var pluginConfig = [	
	{
		"name" : "openEyes-queuedocument",
		"location" : "../demo/queuecollection/openEyes-processDocument.js"
	},
	{
		"name" : "openEyes-processQueueConfirm",
		"location" : "../demo/queuecollection/openEyes-processQueueConfirm.js"
	},
	{
		"name" : "openEyes-queueretrieve",
		"location" : "../demo/queuecollection/openEyes-processQueueRetrieval.js"
	}
]
jigsaw.createServer(routeConfig, pluginConfig, function (err, app) {
	if (err != undefined) { 
		console.log("Error when creating OpenEyes Host")
		throw new Error(err);
	};
	console.log("Binding Public key to the OpenEyes Host");
	app.addPublicKey("../../certs-server/server_public.pem");
	app.QueueProvider.connect(app, 'localhost', '3306', 'jigsaw','jigsawuser','test1234');
	app.listen(routeConfig.port);
});