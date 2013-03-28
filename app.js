var url = require('url');
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = io = require('socket.io').listen(server);
var httpProxy = require('http-proxy');

//Configure Server.
app.configure(function(){
    app.use(express.static(__dirname+'/public'));
});

server.listen(80);


var SlideShare = require('slideshare');
var parseString = require('xml2js').parseString;
var ss = new SlideShare('JIp6G0cG', 'uGbHeRHP');

var screens = {};
var phones = {};
io.set('transports', [
    'websocket'
    , 'flashsocket'
    , 'htmlfile'
    , 'xhr-polling'
    , 'jsonp-polling'
    ]);
io.set('authorization', function (data, accept) {
    return accept(null, true);  
}).sockets.on('connection', function(socket){
    
    socket.on('sync',function(data){
        if(data.type == "screen"){
            screens[data.sid] = socket;
        }
        else if (data.type == "phone"){
            phones[data.sid] = socket;
            var ss = screens[data.sid];
            ss.emit("step1",data);
        }
        
    });
    
    socket.on('login', function(data){
        var username = data.username; 
        ss.getSlideshowsByUser(username, {
            limit: 5, 
            detailed: 0
        }, function(result) { 
            var ss = screens[data.sid];
            ss.emit("step2",data);
            socket.emit("presentations",result);
        });
    });
    
    socket.on('present', function(data){
        //console.log(data.pid);
        var ss = screens[data.sid];
        //console.log(screens[data.sid]);
        ss.emit("step2",data);
        ss.emit("starting-show",{
            "pid":data.pid
        });
        
    });
    socket.on('first', function(data){
        var ss = screens[data.sid];
        ss.emit("first",data);
    });
    socket.on('previous', function(data){
        var ss = screens[data.sid];
        ss.emit("previous",data);
    });
    socket.on('next', function(data){
        var ss = screens[data.sid];
        ss.emit("next",data);
    });
    socket.on('last', function(data){
        var ss = screens[data.sid];
        ss.emit("last",data);
    });
    
    socket.on('disconnect', function(){
        console.log("Connection " + socket.id + " terminated.");
    });

});

//var proxy = httpProxy.createServer(8080, 'preso.ly');
//proxy.listen(80);
