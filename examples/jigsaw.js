/* Example of implementing a Jigsaw server
*  
* This demonstrates configuring a jigsaw server to support ITK services
*/

var jigsaw = require('../lib/jigsaw.js');
var clinicalRoutes = require('../lib/routes/clinicalRoutes');

// this builds up the route paths for your services and would typically be retrieved from your configuration database
routes = clinicalRoutes.init();

// pass the routes paths in and get an instance of a jigsaw server
var app = jigsaw.createServer(routes);
app.addKey("../certs/client_public.pem");

// start listening for messages
app.listen(3000);