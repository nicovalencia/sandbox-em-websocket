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
      this.__connectWebSocket();
      this.__buildCanvas();
    },

    __connectWebSocket: function(){
      this.ws = new WebSocket("ws://0.0.0.0:1337");
      this.ws.onopen = function(e){ console.log('open',e); };
      this.ws.onclose = function(e){ console.log('close',e); };
      this.ws.onerror = function(e){ console.log('error',e); };
      this.ws.onmessage = this.message;
    },

    __buildCanvas: function(){
      this.canvas = Raphael(this.config.x, this.config.y, this.config.width, this.config.height);
    },

    __publishDot: function(x,y){
      this.player.x = x;
      this.player.y = y;
      this.ws.send(JSON.stringify({
        "_id": this._id,
        "x": x,
        "y": y
      }));
    },

    __movePlayer: function(data){
      if( this.player_ids.indexOf(data._id) < 0 ) this.__buildPlayer(data);
      this.players[data._id].dot.animate(
        {"cx": data.x, "cy": data.y},
        100,
        "easeInOut",
        function(){}
      );
    },

    __buildPlayer: function(data){
      this.player_ids.push(data._id);
      this.players[data._id] = {
        x: data.x,
        y: data.y,
        dot: this.canvas.circle(data.x, data.y, this.config.player_width)
      };
      this.players[data._id].dot.attr("fill", helpers.getRGBA());
      this.players[data._id].dot.attr("stroke", "#000");
    },

    __getNewCoords: function(x,y){
      return [this.player.x + x, this.player.y + y];
    },

    __detectCollision: function(x,y){
      // edges of canvas
      var po = this.config.player_width;
      if( x < po || x > this.config.width - po || y < po || y > this.config.height - po ) return true;
      return false;
    },

    message: function(e){
      app.__movePlayer(JSON.parse(e.data));
    },

    keydown: function(e){
      if( !app.keymap.hasOwnProperty(e.keyCode) ) return;
      e.preventDefault();
      var new_coords = app.__getNewCoords.apply(app, app.keymap[e.keyCode]);
      if( app.__detectCollision.apply(app, new_coords) ) return false;
      app.__publishDot.apply(app, new_coords);
    }

  };

  window.app = app;

  app.init();

  $(document).on("keydown", app.keydown);

}).call(this);
