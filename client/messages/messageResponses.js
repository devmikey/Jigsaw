var util = require('util');

/*

Example of use;


      var header = new Array(
            {"name": "Action", "namespace": "http://www.w3.org/2005/08/addressing", "data": "ITK"},
            {"name": "MessageID", "namespace": "http://www.w3.org/2005/08/addressing", "data": "3B318E83-1D56-48AE-B4CD-DA4929376405"},
            {"name": "RelatesTo", "namespace": "http://www.w3.org/2005/08/addressing", "data": "C912A089-E3C7-4C65-93F8-FC47377117C4"}
        );

    getMessage(body,header)


*/
exports.simpleMessageResponse = function(result){
   return  '<itk:SimpleMessageResponse>' + result + '</itk:SimpleMessageResponse>'; 
}

exports.asyncResponse = function(result){
   return  '<itk:asyncResponse>Place holder for async response message</itk:asyncResponse>'; 
}

exports.syncResponse = function(result){
   return  '<itk:syncResponse>' + result + '</itk:syncResponse>'; 
}

exports.itkError = function(err) {
    var msg = new Array();
    msg.push('<soap:Fault>');
    msg.push('<faultcode>soap:Client</faultcode>');
    msg.push('<faultstring>A client related error has occurred, see detail element for further information</faultstring>');
    msg.push('<faultactor>' + err.faultactor + '</faultactor>');
    msg.push('<detail>');
    msg.push('<itk:ToolkitErrorInfo>');
    msg.push('<itk:ErrorID>' + err.id + '</itk:ErrorID>');
    msg.push('<itk:ErrorCode>' + err.code + '</itk:ErrorCode>');
    msg.push('<itk:ErrorText>' + err.text + '</itk:ErrorText>');
    msg.push('<itk:ErrorDiagnosticText>' + err.diagnostictext + '</itk:ErrorDiagnosticText>');
    msg.push('</itk:ToolkitErrorInfo>');
    msg.push('</detail>');
    msg.push('</soap:Fault>');
    return msg.join('');
}
exports.getEnvelope = function(header, body) {

    var msg = new Array();
    msg.push('<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns:itk="urn:nhs-itk:ns:201005">');
    msg.push('<soap:Header>');
    for(var i = 0; i < header.length; i++) {
        msg.push(util.format("<%s xmlns='%s'>%s</%s>", header[i].name, header[i].namespace, header[i].data, header[i].name));
    }
    msg.push('</soap:Header>');
    msg.push('<soap:Body>');
    msg.push(body);
    msg.push('</soap:Body>');
    msg.push('</soap:Envelope>');

    return msg.join('');
}

