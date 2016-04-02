"use strict";
var jsdom = require('jsdom');
var request = require('request');

function reportInitError(err, config) {
    if (config.created) {
        config.created(err);
    }
    if (config.done) {
        config.done(err);
    }
}


exports.request = function (url, config) {
    var req = null;

    config = config || {};

    if (!url) {
        throw "No url specified";
    }


    config.url = url;
    req = handleUrl();

    function createOption() {

        if(!config.userAgent){
            var version = require('../package.json').version;
            config.userAgent = "Mozilla/5.0 Chrome/10.0.613.0 Safari/534.15 spidy/" + version;
        }


        var options = {
            uri: config.url,
            encoding: config.encoding || "utf8",
            headers: config.headers || {},
            pool: config.pool !== undefined ? config.pool : {
                maxSockets: 6
            },
            agentOptions: config.agentOptions !== undefined ? config.agentOptions : {
                keepAlive: true,
                keepAliveMsecs: 115 * 1000
            },
            strictSSL: config.strictSSL !== undefined ? config.strictSSL : true,
            method: config.method || 'GET',
            userAgent: config.userAgent,
            gzip: true,
            jar: config.cookieJar || jsdom.createCookieJar()
        };

        if (config.proxy) {
            options.proxy = config.proxy;
        }

        if (config.formData) {
            options.formData = config.formData;
        }

        options.headers["User-Agent"] = config.userAgent;

        return options;
    }

    function handleUrl() {
        config.cookieJar = config.cookieJar || true;



        return request(createOption(), function (err, res, responseText) {
            if (err) {
                reportInitError(err, config);
                return;
            }

            // The use of `res.request.uri.href` ensures that `window.location.href`
            // is updated when `request` follows redirects.
            config.html = responseText || '';
            config.url = res.request.uri.href;

            if (config.parsingMode === "auto" && (
                res.headers["content-type"] === "application/xml" ||
                res.headers["content-type"] === "text/xml" ||
                res.headers["content-type"] === "application/xhtml+xml")) {
                config.parsingMode = "xml";
            }

            if (res.headers["last-modified"]) {
                config.lastModified = new Date(res.headers["last-modified"]);
            }

            if(config.file){
                delete config.file;
            }

            jsdom.env(config);
        });

        return resourceLoader.download(config.url, createOption(), config.cookieJar, null, function(err, responseText, res) {
            if (err) {
                reportInitError(err, config);
                return;
            }

            // The use of `res.request.uri.href` ensures that `window.location.href`
            // is updated when `request` follows redirects.
            config.html = responseText;
            config.url = res.request.uri.href;

            if (res.headers["last-modified"]) {
                config.lastModified = new Date(res.headers["last-modified"]);
            }

            if (config.parsingMode === "auto") {
                var contentType = parseContentType(res.headers["content-type"]);
                if (contentType && contentType.isXML()) {
                    config.parsingMode = "xml";
                }
            }

            if(config.file){
                delete config.file;
            }

            jsdom.env(config);
        });


    }
    return req;
};

exports.post = function(url, formData, config){
    config = config || {};
    config.method = "POST";
    config.formData = formData;
    exports.request(url, config);
};