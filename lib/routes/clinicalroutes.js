/*

* This is an example showing how to configure the route paths for jigsaw - replace with your own

*/

var documentProcessor = require('../processors/documentProcessor');
var queueProcessor = require('../processors/queueProcessor');    
var interactionHandler = require('../interactionHandler');

exports.init = function() {
    var routes = new Array();

    /* The clinical document service in this example is configured as follows:
    *
    *    /sync/clinicaldocuments - sync invocation style using the request exception interaction pattern
    *    /async/clinicaldocuments - async invocation style using the request response exception interaction pattern
    *
    *    No middleware in this queue collection service
    */

    routes.push(interactionHandler.create("/sync/clinicaldocuments", "requestException", [], documentProcessor.process));
    routes.push(interactionHandler.create("/async/clinicaldocuments", "asyncRequestResponseException", [], documentProcessor.process));

    /* The queue collection service in this example is configured as follows:
    *
    *    all routes use the sync invocation with the request response exception interaction pattern
    *    No middleware used for the queue collection service
    */
    routes.push(interactionHandler.create("/queue/queuemessage", "syncRequestResponseException", [], queueProcessor.addtoqueue));
    routes.push(interactionHandler.create("/queue/retrievebatch", "syncRequestResponseException", [], queueProcessor.getfromqueue));
    routes.push(interactionHandler.create("/queue/confirmcollection", "syncRequestResponseException", [], queueProcessor.removefromqueue));

    return routes;
}