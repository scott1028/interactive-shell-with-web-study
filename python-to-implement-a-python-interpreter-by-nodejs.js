'use strict';


const readline = require('readline');
var cp = require('child_process');

var childProcess = cp.spawn('python', ['-i']);
childProcess.stdout.setEncoding('utf8')

childProcess.stdout.on("data", function(data) {
    console.log();
    console.log(data);
    console.log();
});

childProcess.on('exit', function(){
    console.log('recv exit from childProcess');
    process.exit();
});

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

var waitCommand = function(){
    rl.question('[Python CLI]>> ', (command) => {
        console.log(`Your valuable feedback: ${command}`);
        childProcess.stdin.write(`${command}` + '\n');

        /*
        Suppose the showest command need 0.5 second to be excuted.
        In real world, you can separate both of them into invididual layout.
        */
        setTimeout(waitCommand, 500);
    });
};

waitCommand();

process.on('exit', function(){
    console.log('recv exit signal!');
    rl.close();
});
