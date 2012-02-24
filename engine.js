(function(){

  var app;

  app = {

    _id: new Date().getTime(),

    ws: null,
    player_ids: [],
    players: {},

    config: {
      width: 500,
      height: 500,
      x:100,
      y:100
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
      this.__buildDot();
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

    __buildDot: function(){
      this.dot = this.canvas.circle(this.config.width/2, this.config.height/2, 10);
      this.dot.attr("fill", "#0099ff");
      this.dot.attr("stroke", "#000");
    },

    __publishDot: function(x,y){
      this.ws.send(JSON.stringify({
        "_id": this._id,
        "x": this.dot.attrs.cx + x,
        "y": this.dot.attrs.cy + y
      }));
    },

    __moveDot: function(x,y){
      this.dot.animate(
        {"cx": this.dot.attrs.cx + x, "cy": this.dot.attrs.cy + y},
        100,
        "easeInOut",
        function(){}
      );
    },

    __movePlayer: function(data){
      if( data._id === this._id ) return;
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
        dot: this.canvas.circle(data.x, data.y, 10)
      };
      this.players[data._id].dot.attr("fill", "#ff0000");
      this.players[data._id].dot.attr("stroke", "#000");
    },

    message: function(e){
      app.__movePlayer(JSON.parse(e.data));
    },

    keydown: function(e){
      if( !app.keymap.hasOwnProperty(e.keyCode) ) return;
      e.preventDefault();
      var new_coords = app.keymap[e.keyCode];
      app.__publishDot.apply(app, new_coords);
      app.__moveDot.apply(app, new_coords);
    }

  };

  window.app = app;

  app.init();

  $(document).on("keydown", app.keydown);

}).call(this);
