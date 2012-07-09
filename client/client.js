var fs = require('fs');
var ws = require('ws.js')

exports.send = function(msg) {
    var body = msg.toString(msg);
    var x509 = getX509Token(msg.key);

    var friendlyName = getFriendlyName(x509);
    if(msg.userName == undefined) {
        msg.userName = friendlyName;
    }

    var soapMsg = getSoapMsg(body);
    var signature = getSignature(x509, msg.references);

    var ctx = {
             request: soapMsg
           ,  replyTo: msg.replyTo
           , url: msg.url
           , action: msg.serviceProperties.action
           , contentType: "text/xml"
    };

    var handlers = [
                  new ws.Addr("http://www.w3.org/2005/08/addressing")
                , new ws.Security({}, [new ws.UsernameToken({ username: msg.userName }), x509, signature])
                , new ws.Http()
                ];

    ws.send(handlers, ctx, msg.handler);
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
    x509.getKey().split("subject=/CN=")[1].split("\n")[0];
}

 function getSignature(x509, references){
    var signature = new ws.Signature(x509);
    for(var i = 0; i < references.length; i++) {
        signature.addReference("//*[local-name(.)='" + references[i] + "']");
    }
    return signature;
}