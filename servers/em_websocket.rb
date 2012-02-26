require 'eventmachine'
require 'em-websocket'
require 'em-redis'
require 'json'

@sockets = []
@redis = nil

# SOCKET Server
EM.run do

  # setup redis store
  @redis = EM::Protocols::Redis.connect
  @redis.errback {|e| puts "Redis Error: #{e}"}

  # start server
  EM::WebSocket.start(:host => '0.0.0.0', :port => 1337) do |ws|

    ws.onopen do
      # add client to array
      @sockets << ws
      # list players to new user
      list_players(ws)
    end

    ws.onclose { puts "Client Disconnected" }
    ws.onerror {|e| puts "ERROR: #{e.message}" }
    ws.onmessage {|msg| recieve_message(msg) }

  end

  # message from player
  def recieve_message(msg)
    # save to redis
    @redis.set JSON.parse(msg)["_id"], msg do |response|
      puts "[DEFER] [#{response}] :: Set #{msg}. "
    end

    # publish data to subscribers
    @sockets.each {|s| s.send msg }
  end

  # send a list of players to new user
  def list_players(ws)
    @redis.keys("*") do |keys|
      keys.each do |key|
        @redis.get key do |data|
          ws.send data
        end
      end
    end
  end

end

