##Jigsaw

Jigsaw is an implementation of the Interoperability Toolkit (ITK) specifications for the NHS.

This is currently a barebones implementation.

It has been written in javascript and runs on node.js and mongoDB

## Install
 
To install clone from git then run npm install in the folder

    git clone https://github.com/devmikey/Jigsaw.git
    cd jigsaw
    npm install
	
## Asynchronous demo

	A demonstration is included in the Demo Folder which shows how to configure a client to send an asynchronous message
	to an Jigsaw Server called openEyes. 
	
	The demonstration illustrates how an asynchronous reply can be returned to another Jigsaw server hosted by BlackPear.
	
	To run this demo, you will need to run three shells:
	
    1. node blackpear-host.js
	2. node openEyes-host.js
	3. node blackpear-async-client.js
		
	If an synchronous message pattern is preferred then the blackpear-host is not required and the blackpear-async-client
    would process the response instead.	

## Synchronous demo

	A demonstration is included in the Demo Folder which shows how to configure a client to send a synchronous message
	to an Jigsaw Server called openEyes. 
		
	To run this demo, you will need to run three shells:
	
    1. node openEyes-host.js
	2. node blackpear-async-client.js
	
## Queue Collection demo

	A demonstration is included in the Demo/QueueCollection Folder which shows how to use the queue collection pattern
	
	The queue collection service relies on the prescence of a mysql database called jigsaw
	this database needs to be setup and a single table created called queue.
	
	The table creation script is found in Jigsaw\lib\stores\dbsetup	
	
	The queueServer is configured to access the database through a QueueProvider.
	
	To initiate a connection use QueueProvider.connect 
	This accepts the params (application, host, port, database, user, password)
	
	You can amend the host, database, user and password as required e.g. 
	
	app.QueueProvider.connect(app, 'localhost', '3306', 'jigsaw','jigsawuser','test1234');
	
	Once configured you can test that the queue accepts messages by sending a message to the server as follows:

    1. node queueServer.js
	2. node blackpear-sync-client.js
	
	You should find a message has been stored within the queue table.
	
	To retrieve a batch of messages run
	
	3. node openEyes-retrieveBatch.js
	
	To confirm delivery of the messages run
	
	4. node blackpear-confirmCollection.js
	
Jigsaw makes use of several key modules:

* connect
* expressjs
* mongodb
* node-uuid
* vows
* winston
* ws.js
* xml2js
* xml-crypto
* xmldom


## Features

* An ITK Client which can communicate with any ITK compliant server
    * Creation of Soap packets
    * Creation of Digital Signatures
    * Creation of the Distribution Envelope

* An ITK server that supports
    * Request Exception Message Interaction
    * Request Response Exception Interaction Pattern
    * Queue Collection Service
    * Clinical Correspondence Service

## Roadmap

* Jigsaw Management Console with the following features:
    * Route configuration
    * Reporting and management information
    * Certificate generation
    * Realtime Analysis tools
    * Profile creation - creation of default configurations templates
* Gallery of demonstration Applications
* Middleware
    * Databases Stores
        * SQL Server Store
        * Oracle Store
    * Support Alert
        * Email
        * Tweet Support Plugin
        * UDP broadcast
* REPL - for support processes
* Screencasts
* Documentation
* Accreditation - go through Toolkit accreditation
* Website

## Usage

### ITK Middleware (Handles ITK client requests)
`````javascript

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
`````

### ITK Client (Sends a message to the jigsaw server)
`````javascript

/* This is the BlackPear Client */
var client = require('../client/client');
var distributionEnvelope = require('../messages/distributionEnvelope');

var msgProperties = {
    "serviceName" : "urn:nhs-itk:services:201005:SendDocument-v1-0",
    "key": "../certs-client/client.pem",
    "properties": { "addresslist": new Array("urn:nhs-uk:addressing:ods:Y88764:G1234567"),
        "auditIdentity": new Array("urn:nhs-uk:addressing:ods:R59:oncology"),
        "manifest": [
                        { "mimetype": "application/pdf", "data": "pretend base 64 data" }
                    ],
        "senderAddress": "urn:nhs-uk:addressing:ods:R59:oncology"
    },
    "url": "http://localhost:5000/openeyes/testing/clinicaldocs/openehr/sync",
    "handler": function(ctx) {
        console.log("Received HTTP Response: [" + ctx.statusCode+"]");
		console.log("Received Response: [" + ctx.response+"]");
		console.log("");
    }
}

// Want a user to be able to create their own messages to send
var msg = distributionEnvelope.create(msgProperties);
client.send(msg);

`````
### License
This software is licensed under the **MIT license**.

Copyright (C) 2012 Michael Smith ([mail](mailto:devmikey.js@gmail.com))

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.