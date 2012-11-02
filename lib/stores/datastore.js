var fs = require('fs');

function getdomainIndex(domain, settings) {
	for (var dom = 0; dom < settings.length; dom ++) {
		if (settings[dom].name == domain) {
			 return dom;
		}
	}
}

var load = function(filename, callback) {
	fs.readFile(filename, function (err, data) {
		if (err) {
			if (err.errno === process.ENOENT) {
			// Ignore file not found errors and return an empty result
				callback(null, "");
		} else {
			// Pass other errors through as is
			callback(err);
		}
		} else {
			// Pass successes through as it too.
			callback(null, data);
		}
	})
}

var save = function(settings, filename, callback) {
	fs.writeFile(filename, JSON.stringify(settings),  function (err) {
		if (err) {
			if (err.errno === process.ENOENT) {
			// Ignore file not found errors and return an empty result
				return callback(null, "");
		} else {
			// Pass other errors through as is
			return callback(err);
		}
		} else {
			// Pass successes through as it too.
			return callback(null);
		}
	})
}

exports.setStatus = function(status, domain, route, filename, callback) {
 	try {
			load(filename, function(err, data) {
				if (err != undefined) {
					return callback(err);	
				}
				
				var settings = JSON.parse(data);
				var domainIdx = getdomainIndex(domain, settings);
				
				if (domainIdx == undefined)	{
					return callback(new Error("Unknown domain : " + domain));
				}
				
				var domainSettings = settings[domainIdx].routes;
				for (var i = 0 ; i < domainSettings.length; i++){
					
					if (domainSettings[i].route == route) {
						settings[domainIdx].routes[i].serviceStatus = status;
						
						save(settings, filename, function(err){
							if (err != undefined) {
								return callback(err);
							}
							else {
								return callback(null, settings[domainIdx].routes);
							}					
						});
						
						break;
					}
				}
			})
	}
	catch (err) {
		console.log(err);
		callback(err);
	}	
}

exports.addDomain = function(domain, filename, callback) {
	try {
			load(filename, function(err, data) {
				if (err != undefined) {
					return callback(err);	
				}
				
				var settings = JSON.parse(data);
				var domObj = JSON.parse(domain)
				var domainIdx = getdomainIndex(domObj.name, settings);
				
				if (domainIdx == undefined) {
					settings.push(domObj);
				}
				else {
					return callback(new Error("Domain already exists"));
				}	
				
				save(settings, filename, function(err){
					if (err != undefined) {
						return callback(err);
					}
					else {
						return callback(null);
					}					
				});
		});
	}
	catch (err) {
		callback(err);
	}	
}

exports.addRoute = function(setting, domain, filename, callback) {
	try {
			load(filename, function(err, data) {
				if (err != undefined) {
					return callback(err);	
				}
				
				var settings = JSON.parse(data);
				var domainIdx = getdomainIndex(domain, settings);
				
				if (domainIdx == undefined)	{
					return callback(new Error("Unknown domain : " + domain));
				}
				
				
				settings[domainIdx].routes.push(JSON.parse(setting));	
				
				save(settings, filename, function(err){
					if (err != undefined) {
						return callback(err);
					}
					else {
						return callback(null, JSON.parse(setting));
					}					
				});
		});
	}
	catch (err) {
		callback(err);
	}	
}

exports.removeRoute = function(route, domain, filename, callback) {
	try {
			load(filename, function(err, data) {
				if (err != undefined) {
					return callback(err);	
				}
				
				var settings = JSON.parse(data);
				var domainIdx = getdomainIndex(domain, settings);
				
				if (domainIdx == undefined)	{
					return callback(new Error("Unknown domain : " + domain));
				}
				
				for (var i = 0; i<settings[domainIdx].routes.length; i++) {
					if (settings[domainIdx].routes[i].route == route) {
						settings[domainIdx].routes.splice(i, 1);
						save(settings, filename, function(err){
							if (err != undefined) {
								return callback(err);
							}
							else {
								return callback(null, settings[domainIdx].routes);
							}					
						});
						break;
					}
				}		
		});
	}
	catch (err) {
		callback(err);
	}	
}

exports.loadSettings = load;