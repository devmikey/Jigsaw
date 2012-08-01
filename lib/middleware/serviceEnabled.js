

/**
 * this piece of middleware provides a logger for auditing actions
 **/

module.exports = function(req, res, next) {
    var app = req.app;
	var settings = app.routeSettings;
	for (var i =0; i < settings.length; i++){
		if ("/" +settings[i].route == req.url){
		  console.log("check if " + "/" +settings[i].route + " = " + req.url);
		  if (settings[i].serviceStatus == "stopped"){
			var err = new Error("endpoint " + settings[i].route + " has been disabled ");
			return next(err);
		  }
		  if (settings[i].serviceStatus == "started"){
			return next();
		  }
		  else {
			var err = new Error("endpoint " + settings[i].route + " has been set to an invalid status :" +settings[i].serviceStatus);
			return next(err);
		  }
		}
	}

    return next();
};
