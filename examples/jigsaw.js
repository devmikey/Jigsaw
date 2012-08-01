/* Example of implementing a Jigsaw server
 *
 * This demonstrates configuring a jigsaw server to support ITK services
 */
var jigsaw = require('../lib/jigsaw.js');

// spanners needs to provide functionality to manage plugins and settings
var settingsFile = "c:/users/devmikey/documents/github/spanners/config/settings.json";
var pluginFile = "c:/users/devmikey/documents/github/jigsaw/config/plugins.json";
jigsaw.createServer(settingsFile, pluginFile, function (err, app) {
	if (err != undefined) {
		throw new Error(err);
	};
	
	app.addPublicKey("./certs-server/server_public.pem");
	
	//app.initQueue("staff.mongohq.com", 10063, "nodejitsudb451731216781", function(err){
	/*
	app.initQueue("localhost", 27017, "jigsaw", function(err){
	// start listening for messages once queue initialised
	app.listen(3000);
	});
	 */
	console.log("jigsaw running on http://localhost:3000");
	app.listen(3000);
});

