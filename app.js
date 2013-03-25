var url = require('url');
var express = require('express');
var app = express()
  , server = require('http').createServer(app)
  , io = require('socket.io').listen(server);

//Configure Server.
app.configure(function(){
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(app.router);
    app.use(express.static(__dirname+'/public'));
    app.use(express.errorHandler({
        dumpExceptions: true, 
        showStack: true
    })); //Show errors in development
});
server.listen(80);

var SlideShare = require('slideshare');
var parseString = require('xml2js').parseString;
var ss = new SlideShare('JIp6G0cG', 'uGbHeRHP');

var screens = {};
var phones = {};

io.sockets.on('connection', function(socket){
    
    socket.on('message', function(message){
        socket.broadcast.emit('message', message);
    });
    socket.on('sync',function(data){
        if(data.type == "screen"){
            screens[data.sid] = socket;
        }
        else if (data.type == "phone"){
            phones[data.sid] = socket;
        }
        
    });
    socket.on('login', function(data){
        var username = data.username; 
        ss.getSlideshowsByUser(username, {
            limit: 5, 
            detailed: 0
        }, function(result) { 
            
            socket.emit("presentations",result);
        });
    });
    socket.on('present', function(data){
        //console.log(data.pid);
        var ss = screens[data.sid];
        //console.log(screens[data.sid]);
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