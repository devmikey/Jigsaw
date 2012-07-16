var fs = require('fs');
var ws = require('ws.js');

exports.send = function(properties) {
    var x509 = getX509Token(properties.key);

    var friendlyName = getFriendlyName(x509);
    if(properties.userName == undefined) {
        properties.userName = friendlyName;
    }

    var soapMsg = getSoapMsg(properties.payload);
    var signature = getSignature(x509, properties.references);

    var ctx = {
        request: soapMsg
           , replyTo: properties.replyTo
           , url: properties.url
           , action: properties.serviceProperties.action
           , contentType: "text/xml"
    };

    var handlers = [
                  new ws.Addr("http://www.w3.org/2005/08/addressing")
                , new ws.Security({}, [new ws.UsernameToken({ username: properties.userName }), x509, signature])
                , new ws.Http()
                ];

    ws.send(handlers, ctx, properties.handler);
};

function getSoapMsg(body){

    return "<soap:Envelope xmlns:soap='http://schemas.xmlsoap.org/soap/envelope/' xmlns:itk='urn:nhs-itk:ns:201005'>" +
          "<soap:Header />" +
            "<soap:Body>" +
             body +
            "</soap:Body>" +
          "</soap:Envelope>";
}

function getX509Token(key){
    var x509 = new ws.X509BinarySecurityToken({ "key": fs.readFileSync(key).toString() });
    return x509;
}

function getFriendlyName(x509){
    var key = x509.getKey();
    return key.split("friendlyName: ")[1].split("\n")[0];

}

 function getSignature(x509, references){
    var signature = new ws.Signature(x509);
    for(var i = 0; i < references.length; i++) {
        signature.addReference("//*[local-name(.)='" + references[i] + "']");
    }
    return signature;
}