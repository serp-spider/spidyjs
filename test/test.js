var chai = require('chai');
var spidy = require('spidy');

chai.should();

describe('Http ', function() {
    describe('method', function () {
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
});