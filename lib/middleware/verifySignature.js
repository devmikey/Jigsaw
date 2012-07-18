var Dom = require('xmldom').DOMParser;
var fs = require('fs');
var FileKeyInfo = require('xml-crypto').FileKeyInfo;
var select = require('xml-crypto').xpath.SelectNodes;
var SignedXml = require('xml-crypto').SignedXml;

/**
 * this piece of middleware verifies a digital signature from a soap web service
 **/

module.exports = function (req, res, next) {
    var app = req.app, logger = app.logger, soap = app.body.raw;
	logger.info('Validating signature');
    if (validateXml(logger, soap, app.getPublicKey()) === false) {
		logger.info('The digital signature failed verification');
        var err = new Error("The digital signature failed verification");
        return next(err);
    }

    logger.info('The digital signature was successfully validated');
    return next();
};

/**
* need to rewrite this function to be defensive
*/

function validateXml(logger, xml, key) {
	try {
		var doc = new Dom().parseFromString(xml);
		var signature = select(doc, "/*/*[local-name(.)='Header']/*[local-name(.)='Security']/*[local-name(.)='Signature' and namespace-uri(.)='http://www.w3.org/2000/09/xmldsig#']");
		var sig = new SignedXml();
		sig.keyInfoProvider = new FileKeyInfo(key);
		sig.loadSignature(signature.toString());

		var res = sig.checkSignature(xml);
		if (!res) {
			logger.info(sig.validationErrors);
		}
		return res;
	}
	catch (err) {
		logger.info("Error validating XML "+ err);
		return false;
	}
}
