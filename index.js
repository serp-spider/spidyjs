#!/usr/bin/env node

if(process.versions.node.split('.')[0]<4){
    var node_version = process.versions.node;
    var spidy_version = require('./package.json').version;

    var msg = 'Error! Your node version (v%s) is not compatible with spidy (v%s). ' +
        'Please considere updating to node v4 or newer or using spidyjs v1 (npm install -g spidy@1).';

    console.error(require('util').format(msg, node_version, spidy_version));
    process.exit(1);
}

var args = process.argv.slice(2);

var jsFile;
var internalArgs = [];
var otherArgs = [];

// parse command line args
args.forEach( function(el){

    if(jsFile){
        otherArgs.push(el);
    }else{
        if(el[0] == "-"){
            internalArgs.push(el)
        }else{
            jsFile = el;
            otherArgs.push(jsFile);
        }
    }


});

var minimist = require('minimist');
internalArgs = minimist(internalArgs);


// Print version and exit
if(internalArgs.v || internalArgs.version){
    var version = require('./package.json').version;
    console.log(version);
    process.exit();
}

if(!jsFile){
    console.error('No script specified');
    process.exit(1);
}else{

    // Check file existence
    var fs = require('fs');
    try {
        stats = fs.lstatSync(jsFile);
        if (!stats.isFile()) {
            console.error('File "' + jsFile + '" is not a valid script file.');
            process.exit(1);
        }
    }
    catch (e) {
        console.error('File "' + jsFile + '" does not exist.');
        process.exit(1);
    }

    // Get the new env (makes require('spidy') available for the script)
    var env = require('util')._extend(process.env);
    if(env.NODE_PATH){
        env.NODE_PATH = env.NODE_PATH + ":" + __dirname + '/src';
    }else{
        env.NODE_PATH = __dirname + '/src';
    }

    // Spawn process
    const spawn = require('child_process').spawn;
    var proc = spawn('node', otherArgs);


    // process output
    proc.stdout.on('data', function(data){
        console.log(data.toString('utf8'));
    });
    proc.stderr.on('data', function(data){
        console.error(data.toString('utf8'));
    });
    proc.on('close', function(code){
        process.exit(code);
    });

    // Set timeout
    var timeout = internalArgs.timeout || 120 * 1000;
    setTimeout(function(){
        proc.kill();

        console.log("Timeout of " + (timeout/1000) + "sec reached");
        process.exit(1);
    }, timeout);
}
