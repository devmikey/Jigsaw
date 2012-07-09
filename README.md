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

## Usage

### ITK Middleware (Handles ITK client requests)
`````javascript

var jigsaw = require('jigsaw');
var clinicalRoutes = require('./lib/routes/clinicalRoutes');

// this builds up the route paths for your services and would typically be retrieved from your configuration database
routes = clinicalRoutes.init();

// pass the routes paths in and get an instance of a jigsaw server
var app = jigsaw.createServer(routes);

// start listening for messages
app.listen(18194);

##Features

* An ITK Client which can communicate with any ITK compliant server
    * Creation of Soap packets
    * Creation of Digital Signatures
    * Creation of the Distribution Envelope

* An ITK server that supports
    * Request Exception Message Interaction
    * Request Response Exception Interaction Pattern
    * Queue Collection Service
    * Clinical Correspondence Service

##Roadmap

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