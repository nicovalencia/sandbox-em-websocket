require 'eventmachine'
require 'em-websocket'
require 'em-redis'
require 'json'

@sockets = []

EM.run do

  redis = EM::Protocols::Redis.connect

  redis.errback {|e| puts "Redis Error: #{e}"}

  # redis.get "foo" do |response|
  #   puts "Foo is set to: #{response}"
  # end

  EM::WebSocket.start(:host => '0.0.0.0', :port => 1337) do |ws|

    ws.onopen do
      # add client to array
      @sockets << ws
    end

    ws.onclose { puts "Client Disconnected" }
    ws.onerror {|e| puts "ERROR: #{e.message}" }

    ws.onmessage do |msg|

      # parse data
      msg = JSON.parse(msg)
      position = {:x => msg["x"], :y => msg["y"]}

      # save to redis
      redis.set msg["_id"], position do |response|
        puts "[ASYNC] :: Set #{msg["_id"]} to #{position}."
      end

      # publish data to subscribers
      @sockets.each {|s| s.send msg.to_json }

    end

  end

end
