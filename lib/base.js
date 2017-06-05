'use strict';


module.exports = function(cmd, args, options){
    console.log(cmd);

    var http  = require('http'),
        url   = require('url'),
        path  = require('path'),
        fs    = require('fs'),
        io    = require('socket.io'),
        // util   = require('util'),
        util  = require('util'),
        spawn = require('child_process').spawn;

    // Serve terminal.html
    var server = http.createServer(function(request, response){
        var uri = url.parse(request.url).pathname;
        uri === '/' ? uri += 'terminal.html' : undefined;
        var filename = path.join(process.cwd(), uri);
        fs.exists(filename, function(exists) {
            if (!exists) {
                response.writeHead(404, {'Content-Type':'text/plain'});
                response.end("Can''t find it...");
            }
            fs.readFile(filename, 'binary',function(err, file){
                if (err) {
                    response.writeHead(500, {'Content-Type':'text/plain'});
                    response.end(err + "\n");
                    return;
                }
                response.writeHead(200);
                response.write(file, 'binary');
                response.end();

            });
        });
    });

    let port = 8080;
    server.listen(port);
    console.log(`Listening port ${port}`);

    var listener = io.listen(server);

    listener.on('connection', function(client){
        console.log(`[Before][CMD] ${cmd}`);
        var sh = spawn(cmd, args, options);

        sh.stdout.on('data', function(data) {
            console.log(`[STDOUT] ${data.toString('utf-8')}`);
            listener.sockets.emit('message', data);  // 當終端機有輸出訊息
        });

        sh.stderr.on('data', function(data) {
            console.log(`[STDERR] ${data.toString('utf-8')}`);
            listener.sockets.emit('message', data);  // 當終端機有輸出訊息
        });

        sh.on('exit', function (code) {
            listener.sockets.emit('** Shell exited: '+code+' **');  // 當終端機有輸出訊息
        });

        client.on('message', function(data){
            console.log(data);
            sh.stdin.write(data+"\n");  // .write 相當於 Terminal 指令輸入後按下 Enter
            listener.sockets.emit('message', new Buffer("> "+data));
        });
    });
};