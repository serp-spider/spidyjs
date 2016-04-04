var chai = require('chai');
var spidy = require('../src/spidy');
var spawn = require('child_process').spawn;

chai.should();

describe('module "spidy" ', function() {
    describe('Http method', function () {
        it('get', function (done) {
            spidy.request('http://httpbin.org/get?foo=bar', {
                done: function(err, window){

                    if(err){
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


    describe('the config', function () {
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

            it('redirect & response.url', function (done) {
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


        it('body', function(done){
            spidy.request("http://httpbin.org/post", {
                method: "POST",
                body: "foo=bar",
                done: function(error, window, response){
                    response.statusCode.should.equal(200);
                    data = JSON.parse(window.document.getElementsByTagName('body')[0].innerHTML);
                    Object.keys(data.form).should.have.length(1);
                    data.form['foo'].should.equal('bar');

                    done();
                }
            });
        });

        it('body + headers["content-type"]', function(done){
            spidy.request("http://httpbin.org/post", {
                method: "POST",
                body: "foo=bar",
                headers: {'content-type': 'text/plain'},
                done: function(error, window, response){
                    response.statusCode.should.equal(200);
                    data = JSON.parse(window.document.getElementsByTagName('body')[0].innerHTML);
                    Object.keys(data.form).should.have.length(0);
                    data.data.should.equal('foo=bar');

                    done();
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
        args.unshift('./index.js');
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

    it('--version flag', function (done) {
        spidyBin(['--version'], function(data, code){
            code.should.equal(0, data);
            data.trim().should.equal(require('../package.json').version);
            done();
        });
    });
    it('-v flag', function (done) {
        spidyBin(['-v'], function(data, code){
            code.should.equal(0, data);
            data.trim().should.equal(require('../package.json').version);
            done();
        });
    });

});
