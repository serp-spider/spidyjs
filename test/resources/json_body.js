var spidy = require('../../src/spidy');

var args = process.argv.slice(2);

var url = args[0];
var method = args[1] || 'GET';

var headers = {};

if(method == 'POST'){
    headers['content-type'] = 'application/x-www-form-urlencoded';
}

var data = args[2] || {};


spidy.request(url, {
    method: method,
    body: data,
    headers: headers,
    done: function(error, window){
        console.log(window.document.getElementsByTagName('body')[0].innerHTML);
    }
});