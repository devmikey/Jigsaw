/**
 * Global routes.  These should be included LAST for wildcard 404 route
 * @param app {object} express application object
 **/
module.exports = function(app) {
    
     app.get('/403', function(req, res) {
        throw new Error('This is a 403 Error');
    });  

    // manual 500 error
    app.get('/500', function(req, res) {
        throw new Error('This is a 500 Error');
    });  
    
    // wildcard route for 404 errors
    app.get('/*', function(req, res) {
        throw new Error("Not Found");
    });

     // home page
    app.get('/', function(req, res) {
        res.render('index', { title: 'Pipecleaning Page ' })
    });
}