(function(){

  var app;

  app = {

    _id: new Date().getTime(),
    ws: null,

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

    players: [],

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
      this.ws.onmessage = this.__message;
    },

    __message: function(e){
      console.log('message',e);
    },

    __buildCanvas: function(){
      this.canvas = Raphael(this.config.x, this.config.y, this.config.width, this.config.height);
    },

    __buildDot: function(){
      this.dot = this.canvas.circle(this.config.width/2, this.config.height/2, 10);
      this.dot.attr("fill", "#0099ff");
      this.dot.attr("stroke", "#000");
    },

    __publishDot: function(){
      this.ws.send(JSON.stringify({
        "_id": this._id,
        "x": this.dot.attrs.cx,
        "y": this.dot.attrs.cy
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

    keydown: function(e){
      if( !app.keymap.hasOwnProperty(e.keyCode) ) return;
      e.preventDefault();
      app.__publishDot();
      app.__moveDot.apply(app, app.keymap[e.keyCode]);
    }

  };

  window.app = app;

  app.init();

  $(document).on("keydown", app.keydown);

}).call(this);
