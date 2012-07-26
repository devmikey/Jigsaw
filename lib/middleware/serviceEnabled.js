

/**
 * this piece of middleware provides a logger for auditing actions
 **/

module.exports = function(req, res, next) {
    var app = req.app;
	var routes = app.routePlugins;
	console.log(req.url);
	for (var i =0; i < routes.length; i++){
		if ("/" +routes[i].route == req.url){
		
		  if (routes[i].serviceStatus == "stopped"){
			var err = new Error("endpoint " + routes[i].route + " has been disabled ");
			return next(err);
		  }
		  if (routes[i].serviceStatus == "started"){
			return next();
		  }
		  else {
			var err = new Error("endpoint " + routes[i].route + " has been set to an invalid status :" +routes[i].serviceStatus);
			return next(err);
		  }
		}
	}

    return next();
};
