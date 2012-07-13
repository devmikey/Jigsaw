var util = require('util');
var uuid = require('node-uuid');

// ITK Additional Module Requirements 2.2.3 Field definitions – Confirm Message Receipt
var itkQueueConfirmMessageReceipt = function(QueueName, items) {
    if (items.length == 0) {
        throw "there must be at least one messageHandle provided";    
    }
    var msg = new Array();
    msg.push('<itk:QueueConfirmMessageReceipt xmlns:itk="urn:nhs-itk:ns:201005" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">');
    msg.push(util.format('<itk:QueueName>%s</itk:QueueName>'),QueueName);
    for(var i = 0; i<items.length; i++){
        msg.push(util.format('<itk:MessageHandle>%s</itk:MessageHandle>',items[i]);
    }
    msg.push('</itk:QueueConfirmMessageReceipt');
    return msg.join('');
}

// ITK Additional Module Requirements 2.2.1 Get Messages - Request
var itkQueueMessage = function(queueName, serviceMessageType, requestedMessageCount) {
    var msg = new Array();
    msg.push('<itk:QueueMessage xmlns:itk="urn:nhs-itk:ns:201005" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">');
    msg.push(util.format('<itk:QueueName>%s</itk:QueueName>', queueName);
    if (serviceMessageType){  
        msg.push(util.format('<itk:ServiceMessageType>%s</itk:ServiceMessageType>'), serviceMessageType);
    }
    if (requestedMessageCount) {
        msg.push(util.format('<itk:RequestedMessageCount>%s</itk:RequestedMessageCount>', requestedMessageCount);    
    }
    msg.push('</itk:QueueMessage');
    return msg.join('');
}

// ITK Additional Module Requirements 2.2.2 Get Messages - Response
var itkQueueMessageResponse = function(items) {
    var msg = new Array();
    msg.push('<itk:QueueMessageResponse xmlns:itk="urn:nhs-itk:ns:201005" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">');
    msg.push(util.format('<itk:MessageCount>%s</itk:MessageCount>',items.length);
    for(var i = 0; i<items.length; i++){
        msg.push(util.format('<itk:ServiceMessageType>%s</itk:ServiceMessageType>',items[i].ServiceMessageType);
        msg.push(util.format('<itk:MessageHandle>%s</itk:MessageHandle>',items[i].MessageHandle);
        if (items.RelatesTo){
            msg.push(util.format('<itk:RelatesTo>%s</itk:RelatesTo>',items[i].RelatesTo);    
        }
        msg.push(util.format('<itk:MessagePayload>%s</itk:MessagePayload>',items[i].MessagePayload);
    }
    msg.push('</itk:QueueMessageResponse');
    return msg.join('');
}


exports.create = create;

function getReferenceDefaults(){
    return new Array("Body", "Timestamp");   
}

// need to move these out as these are per service and not transport
function serviceDefaults(){
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
    if (serviceName == "urn:nhs-itk:services:201005:GetMessages-v1-0"){
        return serviceDefaults();
    }
    if (serviceName == "urn:nhs-itk:services:201005:ConfirmMessageReceipt-v1-0"){
        return serviceDefaults();
    } 
    if (serviceName == "urn:nhs-itk:services:201005:SendDocument-v1-0"){
        return serviceDefaults();
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