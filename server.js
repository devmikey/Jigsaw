/* Example of implementing a Jigsaw server
 *
 * This demonstrates configuring a jigsaw server to support ITK services
 */
var jigsaw = require('./lib/jigsaw.js');

// spanners needs to provide functionality to manage plugins and settings

var settings = process.argv[2];
var plugins = process.argv[3];
var publicKey = process.argv[4];

// need to throw an error if the params not passed in
// need to consolidate all of the settings
// need to get the port from the configuration

jigsaw.createServer(settings, plugins, function (err, app) {
	if (err != undefined) {
		throw new Error(err);
	};
	
	app.addPublicKey(publicKey);
	
	//app.initQueue("staff.mongohq.com", 10063, "nodejitsudb451731216781", function(err){
	/*
	app.initQueue("localhost", 27017, "jigsaw", function(err){
	// start listening for messages once queue initialised
	app.listen(3000);
	});
	 */
	var config = JSON.parse(settings);
	console.log("jigsaw running on port " + config.port);
	app.listen(config.port);
});

