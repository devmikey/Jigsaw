var uuid = require('node-uuid');
var util = require('util');

exports.create = create;

function getReferenceDefaults(){
    return new Array("Body", "Timestamp");   
}

// need to move these out as these are per service and not transport
function documentDefaults(){
    return {
            "ns": "urn:nhs-itk:ns:201005",
            "nsprefix": "itk",
            "handlingSpecification": [
                {"key": "urn:nhs-itk:ns:201005:ackrequested", "value": "true"},
                {"key": "urn:nhs-itk:ns:201005:interaction", "value": "POCD_IN150000GB01"}
            ],
            "action":  "urn:nhs-itk:services:201005:SendDocument-v1-0"
        }
}

function getServiceDefaults(serviceName){
    if (serviceName == "urn:nhs-itk:services:201005:SendDocument-v1-0"){
        return documentDefaults();
    } 
    else {
        return {};
    }
}

// set references, uuids and serviceProperties with default values if not already defined
function create(messageProperties)
{
    if (messageProperties.references == undefined) {
        messageProperties.references = getReferenceDefaults();
    } 

    if (messageProperties.serviceProperties == undefined) {
        messageProperties.serviceProperties = getServiceDefaults(messageProperties.serviceName);
    }

    if (messageProperties.properties.trackingid == undefined) {
        messageProperties.properties.trackingid = uuid.v4();    
    }
    
    for(var i = 0; i < messageProperties.properties.manifest.length; i++ ) {
        if (messageProperties.properties.manifest[i].id == undefined){
            messageProperties.properties.manifest[i].id = uuid.v4();   
        }
    }

    messageProperties.payload = toString(messageProperties);
   
    return messageProperties;
}

function toString(o){
  var nsprefix = o.serviceProperties.nsprefix;
  var temp = new Array();

  temp.push(util.format("<%s:DistributionEnvelope xmlns:%s='%s' xmlns:xsi='http://www.w3.org/2001/XMLSchema-instance'>", nsprefix, nsprefix, o.serviceProperties.ns));
  temp.push(util.format("<%s:header service='%s' trackingid='%s'>", nsprefix, o.serviceName, o.properties.trackingid));
  // Address List   
  
  if (o.properties.addresslist) {
	temp.push(util.format("<%s:addresslist>", nsprefix));
	for (i = 0; i<o.properties.addresslist.length;i++){  
		temp.push(util.format("<%s:address uri='%s'/>", nsprefix, o.properties.addresslist[i]));
	};
	temp.push(util.format("</%s:addresslist>", nsprefix));
  }
  // Audit Identity
  if (o.properties.auditIdentity) {
	temp.push(util.format("<%s:auditIdentity>", nsprefix));
	for (i = 0; i<o.properties.auditIdentity.length;i++){  
		temp.push(util.format("<%s:id uri='%s'/>", nsprefix, o.properties.auditIdentity[i]));
	};
	temp.push(util.format("</%s:auditIdentity>", nsprefix));   
  }      
  // Manifest
  temp.push(util.format("<%s:manifest count='%s'>", nsprefix, o.properties.manifest.length));
  for (i = 0; i<o.properties.manifest.length;i++){   
    temp.push(util.format("<%s:manifestitem mimetype='%s' id='uuid_%s'/>", nsprefix, o.properties.manifest[i].mimetype, o.properties.manifest[i].id));
  };
  
  temp.push(util.format("</%s:manifest>", nsprefix));
  if (o.properties.senderAddress) {
    temp.push(util.format("<%s:senderAddress uri='%s'/>", nsprefix, o.properties.senderAddress));
  }
  
  // Handling Specification 
  if (o.serviceProperties.handlingSpecification) {
	temp.push(util.format("<%s:handlingSpecification>", nsprefix));
	for (i = 0; i<o.serviceProperties.handlingSpecification.length;i++){   
		temp.push(util.format("<%s:spec value='%s' key='uuid_%s'/>", nsprefix, o.serviceProperties.handlingSpecification[i].value, o.serviceProperties.handlingSpecification[i].key))
	};
	temp.push(util.format("</%s:handlingSpecification>", nsprefix));
  }
  
  temp.push(util.format("</%s:header>", nsprefix));

  // Payloads
  temp.push(util.format("<%s:payloads count='%s'>", nsprefix, o.properties.manifest.length));
  for (i = 0; i<o.properties.manifest.length;i++){
      temp.push(util.format("<%s:payload id='uuid_%s'>%s</%s:payload>", nsprefix, o.properties.manifest[i].id, o.properties.manifest[i].data, nsprefix));
  };
  temp.push(util.format("</%s:payloads>", nsprefix));
  
  temp.push(util.format("</%s:DistributionEnvelope>", nsprefix));

  return temp.join('');
}