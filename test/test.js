var chai = require('chai');
var spidy = require('../src/spidy');
var spawn = require('child_process').spawn;

chai.should();

describe('Spidy module', function() {
    describe('Http method', function () {
        it('get', function (done) {
            spidy.request('http://httpbin.org/get?foo=bar', {
                done: function(err, window){

                    if(err){
                        console.log(err);
                        done('Http call failed');
                        return false;
                    }else{
                        var data = JSON.parse(window.document.getElementsByTagName('body')[0].innerHTML);
                        Object.keys(data.args).should.have.length(1);
                        data.args['foo'].should.equal('bar');
                        done();
                    }
                }
            });
        });

        it('post', function (done) {
            spidy.post('http://httpbin.org/post', {"foo": "bar"}, {
                done: function(err, window){

                    if(err){
                        done('Http call failed');
                        return false;
                    }else{
                        var data = JSON.parse(window.document.getElementsByTagName('body')[0].innerHTML);
                        Object.keys(data.form).should.have.length(1);
                        data.form['foo'].should.equal('bar');
                        done();
                    }
                }
            });
        });
    });


    describe('config.done', function () {
        it('response object', function (done) {
            spidy.request('http://httpbin.org/response-headers?foo=bar&baz=qux', {
                done: function (err, window, response) {

                    if (err) {
                        done('Http call failed');
                        return false;
                    } else {
                        response.statusCode.should.equal(200);
                        response.headers.foo.should.equal('bar');
                        response.headers.baz.should.equal('qux');
                        response.url.should.equal('http://httpbin.org/response-headers?foo=bar&baz=qux');
                        done();
                    }
                }
            });
        });

        it('redirect + response.url', function (done) {
            spidy.request('http://httpbin.org/redirect-to?url=/get?foo=bar', {
                done: function (err, window, response) {

                    if (err) {
                        done('Http call failed');
                        return false;
                    } else {
                        response.statusCode.should.equal(200);
                        response.url.should.equal('http://httpbin.org/get?foo=bar');
                        done();
                    }
                }
            });
        });

    });


    describe('signature', function () {
        it('request(url, done)', function (done) {
            spidy.request('http://httpbin.org/get?foo=bar', function(err, window){
                if(err){
                    done('Http call failed');
                    return false;
                }else{
                    var data = JSON.parse(window.document.getElementsByTagName('body')[0].innerHTML);
                    Object.keys(data.args).should.have.length(1);
                    data.args['foo'].should.equal('bar');
                    done();
                }
            });
        });

        it('request(url, config, done)', function (done) {
            spidy.request('http://httpbin.org/get?foo=bar', {}, function(err, window){
                if(err){
                    done('Http call failed');
                    return false;
                }else{
                    var data = JSON.parse(window.document.getElementsByTagName('body')[0].innerHTML);
                    Object.keys(data.args).should.have.length(1);
                    data.args['foo'].should.equal('bar');
                    done();
                }
            });
        });
    });

});


describe('Spidyjs binary', function() {

    var spidyBin = function(args, done){
        args.unshift('./src/index.js');
        var output = '';

        var proc = spawn('node', args, {});

        // process output
        proc.stdout.on('data', function(data){
            output += data.toString('utf8');
        });

        proc.stderr.on('data', function(data){
            output += data.toString('utf8');
        });
        proc.on('close', function(code){
            done(output, code);
        });
    };

    describe('http method', function() {

        it('get', function (done) {
            spidyBin(['./test/resources/json_formdata.js', 'http://httpbin.org/get?foo=bar'], function(data, code){

                code.should.equal(0, data);

                data = JSON.parse(data);
                Object.keys(data.args).should.have.length(1);
                data.args['foo'].should.equal('bar');

                done();
            });
        });

        it('post', function (done) {
            spidyBin(['./test/resources/json_formdata.js', 'http://httpbin.org/post', 'POST', '{"foo":"bar"}'], function(data, code){

                code.should.equal(0, data);

                data = JSON.parse(data);
                Object.keys(data.form).should.have.length(1);
                data.form['foo'].should.equal('bar');

                done();
            });
        });
    });

    describe('config', function() {

        it('request body', function (done) {
            spidyBin(['./test/resources/json_body.js', 'http://httpbin.org/post', 'POST', 'foo=bar'], function(data, code){

                code.should.equal(0, data);
                data = JSON.parse(data);
                Object.keys(data.form).should.have.length(1);
                data.form['foo'].should.equal('bar');

                done();
            });
        });

    });
});