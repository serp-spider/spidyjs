var spidy = require('../../src/spidy');

var args = process.argv.slice(2);

var url = args[0];
var method = args[1] || 'GET';

if(args[2]){
    args[2] = JSON.parse(args[2]);
}
var data = args[2] || {};


spidy.request(url, {
    method: method,
    formData: data,
    done: function(error, window){
        console.log(window.document.getElementsByTagName('body')[0].innerHTML);
    }
});