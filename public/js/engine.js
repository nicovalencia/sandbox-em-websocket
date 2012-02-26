(function(){

  var app;

  app = {

    _id: new Date().getTime(),

    ws: null,
    player_ids: [],
    players: {},
    player: {
      x: 250,
      y: 250
    },

    config: {
      player_width: 10,
      width: 500,
      height: 500,
      x:100,
      y:150
    },

    keymap: {
      "38": [0,-50], // up
      "40": [0,50],  // down
      "37": [-50,0], // left
      "39": [50,0]   // right
    },

    init: function(){
      app.connectWebSocket();
      app.buildCanvas();
    },

    connectWebSocket: function(){
      app.ws = new WebSocket("ws://0.0.0.0:1337");
      app.ws.onopen = function(e){ console.log('open',e); };
      app.ws.onclose = function(e){ console.log('close',e); };
      app.ws.onerror = function(e){ console.log('error',e); };
      app.ws.onmessage = app.message;
    },

    buildCanvas: function(){
      app.canvas = Raphael(app.config.x, app.config.y, app.config.width, app.config.height);
    },

    publishDot: function(x,y){
      app.player.x = x;
      app.player.y = y;
      app.ws.send(JSON.stringify({
        _id: app._id,
        x: x,
        y: y
      }));
    },

    movePlayer: function(data){
      if( app.player_ids.indexOf(data._id) < 0 ) app.buildPlayer(data);
      app.players[data._id].dot.animate(
        {"cx": data.x, "cy": data.y},
        100,
        "easeInOut",
        function(){}
      );
    },

    buildPlayer: function(data){
      app.player_ids.push(data._id);
      app.players[data._id] = {
        x: data.x,
        y: data.y,
        dot: app.canvas.circle(data.x, data.y, app.config.player_width)
      };
      app.players[data._id].dot.attr("fill", helpers.getRGBA());
      app.players[data._id].dot.attr("stroke", "#000");
    },

    getNewCoords: function(x,y){
      return [app.player.x + x, app.player.y + y];
    },

    detectCollision: function(x,y){
      // edges of canvas
      var po = app.config.player_width;
      if( x < po || x > app.config.width - po || y < po || y > app.config.height - po ) return true;
      return false;
    },

    message: function(e){
      app.movePlayer(JSON.parse(e.data));
    },

    keydown: function(e){
      if( !app.keymap.hasOwnProperty(e.keyCode) ) return;
      e.preventDefault();
      var new_coords = app.getNewCoords.apply(app, app.keymap[e.keyCode]);
      if( app.detectCollision.apply(app, new_coords) ) return false;
      app.publishDot.apply(app, new_coords);
    }

  };

  window.app = app;

  app.init();

  $(document).on("keydown", app.keydown);

}).call(this);
