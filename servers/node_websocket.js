var io = require('socket.io').listen(1338),
    _ = require('underscore'),
    redis_lib = require('redis'),
    redis = redis_lib.createClient();

redis.on("error", function(e){ console.log(e); });

var sockets = [];

io.sockets.on('connection', function (socket) {

  // add client to array
  sockets.push(socket);

  // list players to new user
  redis.keys("*", function(err, keys){
    _.each(keys, function(key){
      redis.get(key, function(err, msg){
        socket.emit('message', msg);
      });
    });
  });

  socket.on('close', function (data) { console.log(data); });
  socket.on('error', function (data) { console.log(data); });
  socket.on('message', recieveMessage);

  function recieveMessage(msg){
    redis.set(JSON.parse(msg)._id, msg);
    _.each(sockets, function(socket){
      socket.emit('message', msg);
    });
  };

});

