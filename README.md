##Jigsaw

Jigsaw is an implementation of the Interoperability Toolkit (ITK) specifications for the NHS.

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
        *SQL Server Store
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

var jigsaw = require('jigsaw');
var interactionHandler = jigsaw.interactionHandler();

var documentProcessor = function(req,res){
	console.log(req);
}
var routes = new Array();
routes.push(interactionHandler.create("/sync/clinicaldocuments", "requestException", [], documentProcessor));

// pass the routes paths in and get an instance of a jigsaw server
var app = jigsaw.createServer(routes);
app.addKey("client_public.pem");
// start listening for messages
app.listen(3000);

