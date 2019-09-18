var port = process.env.PORT || 3000;
var io = require('socket.io')(port);
var shortId = require('shortid');
var localstorage = require('localStorage');

var players = [];

// var playerSpeed = 3;

var UserProfile = function (serverId, username, roomId) {
    this.serverId = serverId;
    this.username = username;    
    this.roomId = roomId;
};


console.log("server started on port " + port);


io.on('connection', function (socket) 
{

    var Room_ID = String;
    var playername = {};


    var thisPlayerId = shortId.generate();
    var player = 
    {

        id:thisPlayerId,
        destination:{
        x:0,
        y:0,
        z:0    
        },
        lastPosition:
        {
            x:0,
            y:0,
            z:0
        },
        lastMoveTime : 0,
        name:"Player",
        room:"room"

    };

    players[thisPlayerId] = player;
    
    console.log("client connected, id = ", thisPlayerId);
   
    socket.emit('register', {id:thisPlayerId});

    socket.broadcast.emit('requestPosition');  
     
    // for(var playerId in players){
    //     if(playerId == thisPlayerId)
    //         continue;
    //     socket.emit('spawn', {id:players[playerId].id,name:players[playerId].name} );
    //     //socket.emit('spawn',data);
    // };
    socket.on('UserName', function (data) {
        console.log("UserName", data);
        data.id = thisPlayerId;
        socket.broadcast.to(data.roomId).emit('UserName', data);
    });
    

    socket.on('join_room', function(data)
    {
        console.log('Join room = ', data);
        Room_ID = data.roomId;
       // var user_Name = data.username;
        // jsonObject.AddField("roomId",roomname);
        // jsonObject.AddField("username",currentUserName);
        // jsonObject.AddField("serverId",serverId);

        //delete data.room_id;

        socket.join(data.roomId, (err) => {
            if(!err)
            {
                socket.broadcast.to(data.roomId).emit('on_join',data);
                //socket.broadcast.to(Room_ID).emit('spawn', {id:thisPlayerId});
                players[thisPlayerId].name =data.username;
                players[thisPlayerId].room =data.roomId;
                socket.broadcast.to(data.roomId).emit('spawn', {id:thisPlayerId,name:data.username} );
                socket.broadcast.to(data.roomId).emit('requestPosition');   
                
                try{
                for(var playerId in players){

                    if(playerId == thisPlayerId)
                        continue;

                    if(players[playerId].room == data.roomId)
                    {
                        socket.emit('spawn', {id:players[playerId].id,name:players[playerId].name} );
                    }
                    //socket.emit('spawn',data);
                };
            }
            catch(ex)
            {
                console.log("error : " + ex)
            }
            }
        });
        
    });

    

    socket.on('move', function (data) 
    {

        data.id = thisPlayerId;
       // console.log('client moved', JSON.stringify(data));
        
        player.destination.x = data.d.x;
        player.destination.y = data.d.y;
        player.destination.z = data.d.z;
        
        // var elapsedTime = Date.now() - player.lastMoveTime;
        
        // var travelDistanceLimit = elapsedTime * playerSpeed / 1000;
        
        // var requestedDistanceTraveled = lineDistance(player.lastPosition, data.c);
        
        player.lastMoveTime = Date.now();
        
        player.lastPosition = data.c;
        
        delete data.c;
        
        data.x = data.d.x;
        data.y = data.d.y;
       // data.z = data.d.z;
        
        delete data.d;

        console.log('Room id' , data.roomId);
        console.log('moved = ',data);
        socket.broadcast.to(data.roomId).emit('move', data);

    });

    socket.on("SendTextMessage", function(data)
    {
        console.log("SendTextMessage: ", data);
        socket.broadcast.to(data.roomId).emit("SendTextMessage",data);
    });
    
    socket.on('follow', function (data) 
    {
        data.id = thisPlayerId;
        console.log("follow request: ", data);
        socket.broadcast.to(data.roomId).emit('follow', data);
    });
    
    socket.on('updatePosition', function (data) {
        console.log("update position: ", data);
        data.id = thisPlayerId;
        socket.broadcast.to(data.roomId).emit('updatePosition', data);
    });
    
    socket.on('attack', function (data) 
    {
        console.log("attack request: ", data);
        data.id = thisPlayerId;
        io.to(data.roomId).emit('attack', data);
    });

    socket.on('SendVoice', function(data)
    {

        console.log('recived voice: ' ,data);
  
        socket.broadcast.to(data.roomId).emit('SendVoice',data);
        
    }
    );
    
    
    socket.on('disconnect', function () 
    {
        console.log('client disconected');
        delete players[thisPlayerId];
        socket.broadcast.emit('disconnected', {id:thisPlayerId});
    });

});


// function lineDistance(vectorA, vectorB) {
//     var xs = 0;
//     var ys = 0;
    
//     xs = vectorB.x - vectorA.x;
//     xs = xs * xs;
    
//     ys = vectorB.y - vectorA.y;
//     ys = ys * ys;
    
//     return Math.sqrt(xs + ys);
// }