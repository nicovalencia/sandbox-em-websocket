(function(){

  var helpers = {

    getRGBA: function(){
      var colors = [Math.random()*255,Math.random()*255,Math.random()*255,Math.random()*255].join(",");
      return "rgba("+colors+")";
    }

  };

  window.helpers = helpers;


}).call(this);
