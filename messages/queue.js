var util = require('util');
var uuid = require('node-uuid');

// ITK Additional Module Requirements 2.2.3 Field definitions – Confirm Message Receipt
var confirmMessageReceipt = function(messageProperties) {
    if (messageProperties.receivedItems.length == 0) {
        throw "there must be at least one messageHandle provided";    
    }
    var msg = new Array();
    msg.push('<itk:QueueConfirmMessageReceipt xmlns:itk="urn:nhs-itk:ns:201005" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">');
    msg.push(util.format('<itk:QueueName>%s</itk:QueueName>',messageProperties.queueName));
    for(var i = 0; i<messageProperties.receivedItems.length; i++){
        msg.push(util.format('<itk:MessageHandle>%s</itk:MessageHandle>',messageProperties.receivedItems[i]));
    }
    msg.push('</itk:QueueConfirmMessageReceipt>');
    return msg.join('');
}

// ITK Additional Module Requirements 2.2.1 Get Messages - Request
var getbatchRequest = function(messageProperties) {
    var msg = new Array();
    msg.push('<itk:QueueMessage xmlns:itk="urn:nhs-itk:ns:201005" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">');
    msg.push(util.format('<itk:QueueName>%s</itk:QueueName>', messageProperties.queueName));
    if (messageProperties.serviceMessageType){  
        msg.push(util.format('<itk:ServiceMessageType>%s</itk:ServiceMessageType>', messageProperties.serviceMessageType));
    }
    if (messageProperties.requestedMessageCount) {
        msg.push(util.format('<itk:RequestedMessageCount>%s</itk:RequestedMessageCount>', messageProperties.requestedMessageCount));    
    }
    msg.push('</itk:QueueMessage>');
    return msg.join('');
}

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
function getProperties(messageProperties) {

    if (messageProperties.references == undefined) {
        messageProperties.references = getReferenceDefaults();
    } 

    if (messageProperties.serviceProperties == undefined) {
        messageProperties.serviceProperties = getServiceDefaults(messageProperties.serviceName);
    }

    if (messageProperties.properties.trackingid == undefined) {
        messageProperties.properties.trackingid = uuid.v4();    
    }

 return messageProperties;

}

function confirmation(messageProperties)
{
    messageProperties = getProperties(messageProperties);
	messageProperties.payload = confirmMessageReceipt(messageProperties) 
   
    return messageProperties;
}

function batch(messageProperties)
{
    messageProperties = getProperties(messageProperties);
	messageProperties.payload = getbatchRequest(messageProperties) 
   
    return messageProperties;
}

exports.confirmation = confirmation;
exports.batch = batch;
