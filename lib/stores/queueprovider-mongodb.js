// this is the database plugin for accessing the queue store
// the queue needs to be abstracted to deal with multiple stores - at the moment it will assume a mongoDB

var Db = require('mongodb').Db;
var Connection = require('mongodb').Connection;
var Server = require('mongodb').Server;
var BSON = require('mongodb').BSON;
var ObjectID = require('mongodb').ObjectID;

QueueProvider = function(host, port) {
  this.db= new Db('queuecollection', new Server(host, port, {auto_reconnect: true}, {}));
  this.db.open(function(){});
};


QueueProvider.prototype.getCollection= function(callback) {
  this.db.collection('queues', function(error, queue_collection) {
    if( error ) callback(error);
    else callback(null, queue_collection);
  });
};

QueueProvider.prototype.findAll = function(callback) {
    this.getCollection(function(error, queue_collection) {
      if( error ) callback(error)
      else {
        queue_collection.find().toArray(function(error, results) {
          if( error ) callback(error)
          else callback(null, results)
        });
      }
    });
};

QueueProvider.prototype.findtop = function(batch, callback) {
    this.getCollection(function(error, queue_collection) {
        if(error) callback(error)
        else {
            queue_collection.find({},{"raw":1}).sort({ _id: 1 }).limit(batch).toArray(function(error, results) {
                if(error) callback(error)
                else callback(null, results)
            });
        }
    });
};


// db.queues.find({"message.soap:Header.wsa:MessageID":"13e429d0-"})
// abstract the query fields
QueueProvider.prototype.findByMessageId = function(id, callback) {
    // for testing purposes
    this.getCollection(function(error, queue_collection) {
        if(error) callback(error)
        else {
            queue_collection.findOne({ "message.soap:Header.wsa:MessageID": id }, function(error, result) {
                if(error) callback(error)
                else callback(null, result)
            });
        }
    });
};

QueueProvider.prototype.findById = function(id, callback) {
    this.getCollection(function(error, queue_collection) {
      if( error ) callback(error)
      else {
        queue_collection.findOne({_id: queue_collection.db.bson_serializer.ObjectID.createFromHexString(id)}, function(error, result) {
          if( error ) callback(error)
          else callback(null, result)
        });
      }
    });
};

QueueProvider.prototype.save = function(queues, callback) {
    this.getCollection(function(error, queue_collection) {
      if( error ) callback(error)
      else {
        if( typeof(queues.length)=="undefined")
          queues = [queues];

        for( var i =0;i< queues.length;i++ ) {
          queue = queues[i];
          queue.created_at = new Date();
          if( queue.comments === undefined ) queue.comments = [];
          for(var j =0;j< queue.comments.length; j++) {
            queue.comments[j].created_at = new Date();
          }
        }

        queue_collection.insert(queues, function() {
          callback(null, queues);
        });
      }
    });
};

exports.QueueProvider = QueueProvider;