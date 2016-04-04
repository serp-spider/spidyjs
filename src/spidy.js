"use strict";
const jsdom = require('jsdom');

const jsdomModule = require.cache[require.resolve('jsdom')];
const jsdomUtils = jsdomModule.require("./jsdom/utils");
const parseContentType = jsdomUtils.parseContentType;

var request = require('request');


function reportInitError(err, config) {
    if (config.created) {
        config.created(err);
    }
    if (config.done) {
        config.done(err);
    }
}


exports.request = function (url, config, done) {
    var req = null;

    if (!url) {
        throw "No url specified";
    }

    if(typeof config == 'function'){
        done = config;
        config = {};
    }else{
        config = config || {};
    }

    if(done){
        config.done = done;
    }

    config.cookieJar = config.cookieJar || jsdom.createCookieJar();

    config.url = url;
    req = handleUrl();

    return req;

    function wrapCookieJarForRequest(cookieJar) {
        const jarWrapper = request.jar();
        jarWrapper._jar = cookieJar;
        return jarWrapper;
    }

    function createOption() {

        if(!config.userAgent){
            config.userAgent = "Mozilla/5.0 Chrome/10.0.613.0 Safari/534.15 spidy/" + require('../package.json').version;
        }

        var headers = {};

        if(config.headers){
            for(var i in config.headers){
                headers[i.toLowerCase()] = config.headers[i];
            }
        }

        var options = {
            uri: config.url,
            encoding: config.encoding || "utf8",
            headers: headers,
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
            formData: config.formData || null,
            body: config.body || null,
            gzip: true,
            jar: wrapCookieJarForRequest(config.cookieJar)
        };
        if(options.body && !options.headers['content-type']){
            options.headers['content-type'] = 'application/x-www-form-urlencoded';
        }

        if (config.proxy) {
            options.proxy = config.proxy;
        }

        options.headers["User-Agent"] = config.userAgent;

        return options;
    }

    function handleUrl() {

        return request(createOption(), function (err, response, responseText) {
            if (err) {
                reportInitError(err, config);
                return;
            }

            config.html = responseText || '';
            config.url = response.request.uri.href;

            if (config.parsingMode === "auto" && (
                response.headers["content-type"] === "application/xml" ||
                response.headers["content-type"] === "text/xml" ||
                response.headers["content-type"] === "application/xhtml+xml")) {
                config.parsingMode = "xml";
            }

            if (response.headers["last-modified"]) {
                config.lastModified = new Date(response.headers["last-modified"]);
            }

            if (config.file) {
                delete config.file;
            }

            var done = config.done;

            config.done = function(err, window){
                if(done){
                    if(typeof done !== 'function'){
                        throw 'done config should be a function' + (typeof done) + ' given instead';
                    }else{
                        done(err, window, {
                            url: config.url,
                            statusCode: response.statusCode,
                            headers: response.headers
                        })
                    }
                }
            };


            jsdom.env(config);

        });
    }

};

exports.post = function(url, formData, config){
    config = config || {};
    config.method = "POST";
    config.formData = formData;
    exports.request(url, config);
};
