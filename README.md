SpidyJS
=======

A headless browser built for [SERPS](https://serp-spider.github.io/).

[![Build Status](https://travis-ci.org/serp-spider/spidyjs.svg?branch=1.x)](https://travis-ci.org/serp-spider/spidyjs)
[![npm version](https://badge.fury.io/js/spidy.svg)](https://badge.fury.io/js/spidy)

It's a - 100% javascript - no gui - browser. 
It is actually a dead simple wrapper around [jsdom](https://github.com/tmpvar/jsdom).
Its goal is to add the missing features to make it easy to use for SERPS, but it can be used for any other purpose. 

Install
-------

It requires nodejs version 4 or newer.

```js
npm install -g spidy@2
```

there is a release for older node versions, but it is deprecated.

```js
npm install -g spidy@1
```

Overview
--------

Create a js file (``file.js``) with what you want to run:

```js
var spidy = require('spidy');

spidy.request('http://httpbin.org/ip', function(error, window){
  console.log(window.document.documentElement.innerHTML);
});
```

and call it with from the command line with ``spidyjs``: 

``$ spidyjs file.js``

**Important notice**: by default external resources (javascript, images...) are not processed; 
see (enable external resources)[#enable-external-resources] for more details.

Api
---

Spidy offers the request method with different signatures:
 
- ``spidy.request(url, done)``.
- ``spidy.request(url, config)``.
- ``spidy.request(url, config, done)``.

- ``url`` is the url to query
- ``done`` is a callback triggered when request finishes (see ``config.done`` 
- ``config`` is an object that can contain the following items (mostly the same that the ones from jsdom):
    - `config.method`: The http method to use (POST, GET, PUT...) default to ``GET``.
    - `config.headers`: an object giving any headers that will be used while loading the HTML from `config.url`, if applicable.
    - `config.formData`: data to be sent with the request, useful for post queries.
    - `config.body`: the http body for ``POST`` or ``PUT`` queries. If body contains some data and if the header `content-type` is not set, 
    then `application/x-www-form-urlencoded` will be set as content type.
    - `config.proxy`: A proxy to use for the requests with the form: ``http[s]://ip:port``
    - `config.cookieJar`: cookie jar which will be used by document and related resource requests.
    - `config.done`: a callback called when the resources has finished loading. See bellow.
    - `config.parsingMode`: either `"auto"`, `"html"`, or `"xml"`. The default is `"auto"`, 
    which uses HTML behavior unless `config.url` responds with an XML `Content-Type`. 
    Setting to `"xml"` will attempt to parse the document as an XHTML document. (jsdom is [currently only OK at doing that](https://github.com/tmpvar/jsdom/issues/885).)
    - `config.referrer`: the new document will have this referrer.
    - `config.cookie`: manually set a cookie value, e.g. `'key=value; expires=Wed, Sep 21 2011 12:00:00 GMT; path=/'`. Accepts cookie string or array of cookie strings.
    - `config.userAgent`: the user agent string used in requests;
    - `config.features`: configs to control javascript execution.
    - `config.resourceLoader`: a function that intercepts subresource requests and allows you to re-route them, modify, or outright replace them with your own content. More below.
    [see on jsdom doc](https://github.com/tmpvar/jsdom#initialization-lifecycle). Please note that setting the third parameter will automatically replace ``config.done`` value.
    - `config.concurrentNodeIterators`: the maximum amount of `NodeIterator`s that you can use at the same time. The default is `10`; setting this to a high value will hurt performance.
    - `config.virtualConsole`: a virtual console instance that can capture the window’s console output; 
    [see on jsdom doc](https://github.com/tmpvar/jsdom#capturing-console-output).
    - `config.pool`: an object describing which agents to use for the requests; defaults to `{ maxSockets: 6 }`; 
    [see node request doc](https://github.com/request/request#requestoptions-callback) for more details.
    - `config.agentOptions`: the agent options; defaults to `{ keepAlive: true, keepAliveMsecs: 115000 }`;
    [see node http doc](https://nodejs.org/api/http.html).
    - `config.strictSSL`: if `true`, requires SSL certificates be valid; defaults to `true`;
    [see node request doc](https://github.com/request/request#requestoptions-callback).
    - `config.scripts`: scripts to inject in the loaded document. See the [doc from jsdom](https://github.com/tmpvar/jsdom#easymode-jsdomenv)
    - `config.src`: an array of JavaScript strings that will be evaluated against the resulting document. Similar to `scripts`, but it accepts JavaScript instead of paths/URLs.


**Post data**

For convenience a ``spidy.post(url, formData, config)`` method is also available:

```js
var spidy = require('spidy');

spidy.post('http://httpbin.org/post', {'foo': 'bar'}, {
    done: function(error, window){
        console.log(window.document.documentElement.innerHTML);
    }
});
``` 
It's simply a shortcut for ``spidy.request``, and it will set ``config.method = 'POST'`` and ``config.formData = formData``.


Done callback
-------------

The done callback takes 3 parameters:

- `err`: the error message, `null` means that everything was fine.
- `window`: the window object with the same api as in the browser.
- `response`: the response object that contains the data from the http response:
    - `url`: the final url (considering redirects)
    - `statusCode`: the http status code
    - `headers`: the headers from the response


Enable external resources
-------------------------

As the jsdom doc states it, external resources are not proved to be safe:

> By default, `jsdom.env` will not process and run external JavaScript, 
> since our sandbox is not foolproof. That is, code running inside the DOM's `<script>`s can, 
> if it tries hard enough, get access to the Node environment, and thus to your machine. 

To enable javascripts (at your own risks) add the following ``features`` to the configuration:

```json
features: {
    "FetchExternalResources": ["script"],
    "ProcessExternalResources": ["script"],
    "SkipExternalResources": false
}
```

Use a timeout
-------------

When invoking spidy you can use a timeout:

```sh
$ spidyjs --timeout=5000 file.js
```

This example will fail if ``file.js`` is longer than 5sec (5000ms) to execute.

The **default timeout** is 120secs.

Use command line args
---------------------

In the script file, it is possible to get additional arguments passed on the command line.

```js
var spidy = require('spidy');

var args = process.argv.slice(2);

var url = args[0];

spidy.request(url, {
    done: function(error, window){
        console.log(window.document.documentElement.innerHTML);
    }
});
```

You can call this script:

``$ spidyjs file.js http://httpbin.org/ip``


Spidy version
-------------

check the spidy version with 

``$ spidyjs -v``


License
-------

This work is placed under the terms of the [FAIR licence](https://opensource.org/licenses/Fair)
