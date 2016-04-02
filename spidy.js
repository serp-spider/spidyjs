"use strict";
const jsdom = require('jsdom');
const request = require('request');

const jsdomModule = require.cache[require.resolve('jsdom')];
const jsdomUtils = jsdomModule.require("./jsdom/utils");
const parseContentType = jsdomUtils.parseContentType;

const resourceLoader = jsdomModule.require("./jsdom/browser/resource-loader");


function reportInitError(err, config) {
    if (config.created) {
        config.created(err);
    }
    if (config.done) {
        config.done(err);
    }
}


exports.request = function (url, config) {
    let req = null;

    config = config || {};

    if (!url) {
        throw "No url specified";
    }


    config.url = url;
    req = handleUrl();

    function createOption() {

        if(!config.userAgent){
            var version = require('./package.json').version;
            config.userAgent = "Mozilla/5.0 Chrome/10.0.613.0 Safari/534.15 spidy/" + version;
        }

        const options = {
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
            userAgent: config.userAgent
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
        config.cookieJar = config.cookieJar || jsdom.createCookieJar();
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
                const contentType = parseContentType(res.headers["content-type"]);
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