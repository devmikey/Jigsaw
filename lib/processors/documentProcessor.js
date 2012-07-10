
exports.process = function(req, res, callback) {
    try {
        return callback(null, "processdocument");
    }
    catch(err) {
       return callback(err);
    }
}