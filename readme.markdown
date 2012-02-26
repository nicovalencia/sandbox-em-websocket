sandbox-em-websocket
====================

EventMachine server with em-websocket support and Javascript client.
Raphael JS animates user avatar backed in a redis store.

![Players](http://github.com/nicovalencia/sandbox-em-websocket/raw/master/screen-shot.png "Players")

Setup
-----

Static file server (0.0.0.0:9000):

    ruby servers/static.rb

EventMachine WebSocket server (0.0.0.0:1337):

    ruby servers/em_websocket.rb

