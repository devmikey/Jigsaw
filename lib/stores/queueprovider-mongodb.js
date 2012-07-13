// this is the database plugin for accessing the queue store
// the queue needs to be abstracted to deal with multiple stores - at the moment it will assume a mongoDB
var nodeQueue = require('node-queue');
var queue;

var QueueProvider = function(host, port, database, callback) {
    nodeQueue.connect({
            "type": 'mongoDb',
            "host": host,      // optional
            "port": port,            // optional
            "dbName": database,      // optional
            "collectionName": 'msgQueue' // optional
        }, 
        function(err, myQueue) {
            if(err) {
                return callback(err);
            } else {
                queue = myQueue;
                return callback(null);
            }
        }
    );
};

QueueProvider.prototype.getNewId = function(callback) {
	queue.getNewId(function (err, newId) {
		return callback(err, newId);
	})
}

QueueProvider.prototype.add = function(id, data, callback) {
    queue.push(id, data, function(err) {
        return callback(err);
    });
}

QueueProvider.prototype.isQueued = function(id, callback) {
    queue.isQueued(id, function(err) {
        callback(err)
    })
}

QueueProvider.prototype.findtop = function(batch, callback) {
    queue.queue.find({},{"raw":1}).sort({ _id: 1 }).limit(batch).toArray(function(err, items) {
        if (err) {
            callback(err)    
        }
        callback(null, items)    
    });
};

QueueProvider.prototype.getAll = function (callback) {
    queue.getAll(function(err, items) {
        if(err) {
            return callback(err)
        }

        return callback(null, items)
    });

}

QueueProvider.prototype.remove = function (id, callback) {
	queue.remove(id, function(err) {
         if(err) {
            return callback(err)
        }

        return callback(null)
    })
}

exports.QueueProvider = QueueProvider;

/* 

old queue management functions

*/

/*
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
        }

        queue_collection.insert(queues, function() {
          callback(null, queues);
        });
      }
    });
};

*/


