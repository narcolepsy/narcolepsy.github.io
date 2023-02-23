require 'json'
require 'net/http'
require 'uri'

class Departure
  attr_accessor :stop_id, :service_name, :destination, :departure_time_unix, :departure_time_iso, :departure_time, :real_time, :journey_id, :vehicle_id, :minutes, :diverted, :partRoute, :occupancy_rate
  def initialize(departure)
    @departure_time = departure["departure_time"]
    @diverted       = departure["diverted"]
    @partRoute      = departure["partRoute"]
    @real_time      = departure["real_time"]
  end
  def to_s
    str = ""
    if @diverted
      str << "D" 
    else
      str << " "
    end
    if @partRoute
      str << "P"
    else
      str << " "
    end
    #Have diversion and partroute as prefixes, realtime as suffix
    str << @departure_time
    if !@real_time
      str << "*"
    else
      str << " "
    end
    str << "|"
  end
end
class Service
  attr_accessor :service_name, :departures, :first_departure
  def initialize(service)
    @service_name = service["service_name"]
    @first_departure = service["first_departure"]
    @departures = []
    service["departures"].each do |departure|
      mydep = Departure.new(departure)
      @departures << mydep
    end
  end
  def to_s
    str = ""
    departures.each do |dep|
      str << dep.to_s
    end
    mstr = ""
    #mstr << "--------------------------------------------\n"
    mstr << "Service "
    mstr << "%04s " % @service_name
    mstr << str + "\n"
  end
end

class Stop
  attr_accessor :services, :name, :id, :direction
  def initialize(id)
    myurl = "https://tfeapp.com/api/website/stop_times.php?stop_id=" + id.to_s
    myurl = uri = URI.parse(myurl)
    response = Net::HTTP.get_response uri
    b = JSON.parse(response.body)
    mystop = b["stop"]
    @name = mystop["name"]
    @id   = mystop["id"]
    @direction = mystop["direction"]
    @services  = []
    puts "ERROR: id mismatch" if id != @id
    puts self.to_s
    b["services"].each do |service|
      mysvc = Service.new(service)
      @services << mysvc
      puts mysvc.to_s
    end
  end
  def to_s
    str = ""
    str << "--------------------------------------------\n"
    str << "#{@name}[#{@direction}] (#{@id})\n"
    end
end


puts Time.now
stops = ["6200243730","6200243730","6200243720","6200243470","6200243450","6200243440","6200240030", "6200238760", "6200209930"]
stops = ["6200243730","6200240030","6200246890","6200243510"]
stops.each do |stop|
  mys = Stop.new(stop)
end

#https://tfeapp.com/api/website/stop_times.php?stop_id=6200243730
#https://tfeapp.com/api/website/stop_times.php?stop_id=6200243720 - lauriston place
#https://tfeapp.com/api/website/stop_times.php?stop_id=6200243470 - bristo place
#https://tfeapp.com/api/website/stop_times.php?stop_id=6200243450 - chapel st
#https://tfeapp.com/api/website/stop_times.php?stop_id=6200243440 - buccleuch
#https://tfeapp.com/api/website/stop_times.php?stop_id=6200240030 - sciennes house pl
#
#irb(main):017:0> b["services"].select{|service| service["service_name"] == "12"}
#=> [{"service_name"=>"12", "departures"=>[{"stop_id"=>"36236464", "service_name"=>"12", "destination"=>"Gyle Centre", "departure_time_unix"=>1676545100, "departure_time_iso"=>"2023-02-16T10:58:20+00:00", "departure_time"=>"10:58", "real_time"=>true, "journey_id"=>"3460", "vehicle_id"=>"1062", "minutes"=>8, "diverted"=>false, "partRoute"=>false, "occupancy_rate"=>nil}, {"stop_id"=>"36236464", "service_name"=>"12", "destination"=>"Gyle Centre", "departure_time_unix"=>1676546921, "departure_time_iso"=>"2023-02-16T11:28:41+00:00", "departure_time"=>"11:28", "real_time"=>true, "journey_id"=>"3478", "vehicle_id"=>"13", "minutes"=>39, "diverted"=>false, "partRoute"=>fl_time"=>false, "journey_id"=>"3406", "vehicle_id"=>"29", "minutes"=>68, "diverted"=>false, "partRoute"=>false, "occupancy_rate"=>nil}, {"stop_id"=>"36236464", "service_name"=>"12", "destination"=>"Gyle Centre", "departure_time_unix"=>1676550486, "departure_time_iso"=>"2023-02-16T12:28:06+00:00", "departure_time"=>"12:28", "real_time"=>false, "journey_id"=>"3418", "vehicle_id"=>"8", "minutes"=>98, "diverted"=>false, "partRoute"=>false, "occupancy_rate"=>nil}], "first_departure"=>8}]
#irb(main):011:0> b["stop"]
#=> {"id"=>"6200243730", "name"=>"Lauriston Building", "identifier"=>nil, "direction"=>"W"}
#
#https://tfeapp.com/api/website/stop_times.php?stop_id=
#https://tfeapp.com/api/website/stop_times.php?stop_id=
