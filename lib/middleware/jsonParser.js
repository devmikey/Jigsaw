xml2js = require('xml2js');
util = require('util')
/**
 * this piece of middleware parses the soap object in the app.body.raw and stores the json result in app.body.json
 **/

var complexElements = new Array();
var childElements = new Array();

function defineComplexElements(){
     for (var i = 0; i < arguments.length; i++) {
         var tmparray = arguments[i].split('/');
         var child = tmparray.pop();
         complexElements.push(tmparray.join('/'));
         childElements.push(child);
     }                              
}

var buildJson = function(xpath, currentValue, newValue) {

    var idx = complexElements.indexOf(xpath);
    if(idx > -1) {     
        var child = childElements[idx];
        if(!(newValue[child] instanceof Array)) {
          var temp = newValue[child];
          newValue[child] = new Array(temp);
        }   
    }

    return newValue;
}

module.exports = function(req, res, next) {
    // this needs to be passed through as part of the config
    // ideally this should be built up from an xsd

    // build the xpaths elements that should be treated as arrays all the time
    defineComplexElements('/soap:Envelope/soap:Body/itk:DistributionEnvelope/itk:header/itk:addresslist/itk:address'
                        , '/soap:Envelope/soap:Body/itk:DistributionEnvelope/itk:header/itk:auditIdentity/itk:id'
                        , '/soap:Envelope/soap:Body/itk:DistributionEnvelope/itk:header/itk:manifest/itk:manifestitem'
                        , '/soap:Envelope/soap:Body/itk:DistributionEnvelope/itk:header/itk:handlingSpecification/itk:spec'
                        , '/soap:Envelope/soap:Body/itk:DistributionEnvelope/itk:payloads/itk:payload');
    var app = req.app;
    var logger = app.logger;
    var parser = new xml2js.Parser({ mergeAttrs: true, explicitArray: false, validator: buildJson });
    parser.addListener('end', function(result) {
        app.body.json = result;
        //console.log(util.inspect(result, false, null))
        logger.log('info', 'Soap message converted to json', '');
        return next();
    });
    parser.parseString(app.body.raw);
};
