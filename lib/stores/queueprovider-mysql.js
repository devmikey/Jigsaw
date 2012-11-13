// this is the mysql database plugin for accessing the queue store
var mysql = require('mysql');

// app opens the connection once only
var connect = function(app, host, port, database, user, password) {
    connection = mysql.createConnection({
		'host'     : host,
		'user'     : user,
		'password' : password,
		'database' : database
	});
	
	connection.connect();
	app.QueueProvider.connection = connection;
	console.log("Queue Bound to Application");
};

// close connection
var end = function(app,callback) {
  connection.end(function(err) {
	return callback(err);
  });
}

var getBatch = function(app,callback) {
    // test if already in the queue if so throw an error
	// get batchNo from msg or app.json obejct
	// get queueName and message from app.body.json object and body.raw
	var batchNo = "5";
	var queueName = app.body.json["soap:Body"]["itk:QueueMessage"]["itk:QueueName"];
	var cmd = 'SELECT CONVERT(message USING utf8) as message, messageId  from queue WHERE queuename = "' + queueName +'" and status = 0 LIMIT ' + batchNo;
	var items = new Array();
	app.QueueProvider.connection.query(cmd, function(err, rows, fields) {
		if (err) throw err;
		
		for (var i =0; i < rows.length; i++){
		  // create an in statement and execute at the end 
		  items[i] = {};
		  items[i].messageId = rows[i].messageId;
		  items[i].message = rows[i].message;
		  
		  var updatecmd = 'update queue set status = 1 WHERE queuename = "' + queueName +'" and status = 0 and messageId = "' + rows[i].messageId +'"';
			app.QueueProvider.connection.query(updatecmd, function(err, rows, fields)  {
		  });
		  
		  // build up the response message here
		}
		
		return callback(items, null);
	});
	
	
}

var add = function(app, queueName, callback) {
	// test if already in the queue if so throw an error
	// get msg id from msg or app.json obejct
	// get queueName and message from app.body.json object and body.raw
	var msg = app.body.json;
	var messageId = msg['soap:Header']['wsa:MessageID'];
	var data = app.QueueProvider.connection.escape(app.body.raw);	
    var cmd = 'INSERT INTO queue (messageId, queueName, message, datereceived) values ("' + messageId +'", "' + queueName + '", "' + data +'", NOW())';
	console.log(cmd);
	app.QueueProvider.connection.query(cmd, function(err, rows, fields) {
		return callback(err);
	});
}

var isQueued = function(app,queueName,callback) {
	var cmd = 'SELECT TOP ' + batchNo +' from queue WHERE queuename =  "' + queueName +'" and status = 1';
	app.QueueProvider.connection.query(cmd, function(err, rows, fields) {
		if (err) throw err;
		console.log('The solution is: ', rows[0].solution);
	});
}

/* status of message
0 - ready to retrieve
1 - retrieved pending confirmation
2 - confirmation received - pending archiving
*/ 
var update = function (app, callback) {
	// test if already in the queue if so throw an error
	var msg = app.body.json;
	var queueName = msg['soap:Body']['itk:QueueConfirmMessageReceipt']['itk:QueueName'];
	
	// group these into a batch statement and execute per batch
	var MessageHandle = msg['soap:Body']['itk:QueueConfirmMessageReceipt']['itk:MessageHandle'];
	for (var i = 0; i< MessageHandle.length; i++){
	  cmd = 'UPDATE queue SET status = 2 WHERE queueName = "' + queueName +'" and messageId = "' + MessageHandle[i] + '"';
	  console.log(MessageHandle[i]);
	  app.QueueProvider.connection.query(cmd, function(err, rows, fields) {
		
	  });
	}
	
	return callback();

}

var archive = function (id, queueName, callback) {
	// move into archive table
}

exports.connect = connect;
exports.archive = archive;
exports.update = update;
exports.isQueued = isQueued;
exports.add = add;
exports.getBatch = getBatch;
exports.end = end;



