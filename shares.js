var allshares = [];
var allcurrency = [];
var shares_completed = 0;
var currency_completed = 0;
eval("apikey = \"" + getQueryVariable("apikey")+ "\"");
console.log(apikey);
window.onload = function() {
   //sqlite3 -header -column shares.db 'select Price,Rate,Crus_GBP from Shares;'
   //d3.selectAll("p").style("color", "blue");
   //https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=CRUS&apikey=<apikey>
   url = "https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=CRUS&apikey="+apikey;
   url = "https://www.alphavantage.co/query?function=CURRENCY_EXCHANGE_RATE&from_currency=USD&to_currency=GBP&apikey="+apikey;
   url = "https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=CRUS&interval=5min&apikey="+apikey;
   url2 = "https://www.alphavantage.co/query?function=FX_INTRADAY&from_symbol=USD&to_symbol=GBP&interval=5min&apikey="+apikey;

   console.log(url);
   add_shares_to_array("CRUS",add_to_shares);
   add_shares_to_array("AAPL",add_to_shares);
   add_currency_to_array("USD-GBP",add_to_currency); //TODO do something with this argument
   console.log(allshares);
}
var add_to_shares = function(share_list,completed_queries,passed) {
   allshares = allshares.concat(share_list);
   shares_completed = shares_completed + completed_queries;
   console.log("Adding shares: completed="+shares_completed+"passed="+passed);
   console.log(allshares);
   check_if_done();
}
var add_to_currency = function(share_list,completed_queries,passed) {
   allcurrency = allcurrency.concat(share_list);
   currency_completed = currency_completed + completed_queries;
   console.log("Adding currency: completed="+currency_completed+"passed="+passed);
   console.log(allcurrency);
   check_if_done();
}
function check_if_done() {
   if (shares_completed == 2 && currency_completed == 1) {
      //TODO parameterise the above two constants
      console.log("Entering complete state - about to merge data and plot");
      console.log(allshares);
   }
}
function add_shares_to_array(index, callback) {
   url = "https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol="+index+"&apikey="+apikey;
   var req = new XMLHttpRequest();
   var passed = 0;
   var completed = 0;
   req.onreadystatechange = function() {
      if (req.readyState == 4 && req.status == 200) {
         var myObj = JSON.parse(req.responseText);
         //document.getElementById("demo").innerHTML = myObj.name;
         console.log(myObj);
         mydata = create_data(myObj);

         draw_graph(mydata);
         passed = 1;
         completed = 1;
         callback.apply(req,[mydata,completed,passed]);
      }
   }
   req.open("GET", url, true);
   req.send();
}
function add_currency_to_array(index, callback) {
   url = "https://www.alphavantage.co/query?function=FX_DAILY&from_symbol=USD&to_symbol=GBP&apikey="+apikey;
   var req = new XMLHttpRequest();
   var completed = 0;
   var passed = 0;
   req.onreadystatechange = function() {
      if (req.readyState == 4 && req.status == 200) {
         var myObj = JSON.parse(req.responseText);
         //document.getElementById("demo").innerHTML = myObj.name;
         console.log(myObj);
         mydata = create_data(myObj);

         draw_graph(mydata);
         console.log(mydata);
         completed = 1;
         passed = 1;
         callback.apply(req,[mydata,completed,passed]);
      }
   }
   req.open("GET", url, true);
   req.send();
}

function getQueryVariable(variable)
{
   var query = window.location.search.substring(1);
   var vars = query.split("&");
   for (var i=0;i<vars.length;i++) {
      var pair = vars[i].split("=");
      if(pair[0] == variable){return pair[1];}
   }
   return(false);
}
function create_data(json_input) {
   //create empty hash to fill up
   var data_array = [];
   var myquery;
   for (var key in json_input) {
      if (!json_input.hasOwnProperty(key)) continue;
      //Skip the metadata
      if (key === "Meta Data") {
         type = json_input[key]
         if (type["1. Information"] === "Daily Prices (open, high, low, close) and Volumes") {
            myquery = type["2. Symbol"];
            mytimezone = "-0400";
         }
         else if (type["1. Information"] === "Forex Daily Prices (open, high, low, close)") {
            myquery = type["2. From Symbol"] + type["3. To Symbol"];
            mytimezone = "+0000";
         }
         console.log(myquery);
      }
      else {
         var obj = json_input[key]
         //Now we have the time series we need to iterate through all the keys in here
         for (var timestamp in obj) {
            var data_hash = {};
            //skip if property is from prototype
            if (!obj.hasOwnProperty(timestamp)) continue;
            data_hash["key"]     = myquery;
            //data_hash["time"]    = timestamp+mytimezone;
            data_hash["time"]    = timestamp;
            data_hash["price"]   = obj[timestamp]["4. close"];
            data_array.push(data_hash)
         }
      }
   }
   //var parseDate = d3.timeParse("%Y-%m-%d %H:%M:%S%Z");
   var parseDate = d3.timeParse("%Y-%m-%d");
   data_array.forEach(function(d) {
      d.time = parseDate(d.time);
      d.price = +d.price;
   });
   console.log(data_array)
   return data_array;
}

function draw_graph(mydata) {
   //trying a different method 
   // Set the dimensions of the canvas / graph
   var margin = {top: 30, right: 20, bottom: 30, left: 50},
      width = 600 - margin.left - margin.right,
      height = 270 - margin.top - margin.bottom;
   // Parse the date / time
   // Set the ranges
   var x = d3.scaleTime().range([0, width]);
   var y = d3.scaleLinear().range([height, 0]);
   // Define the line
   var priceline = d3.line()
      .x(function(d) { return x(d.time); })
      .y(function(d) { return y(d.price); });
   // Adds the svg canvas
   var svg = d3.select("body")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform",
         "translate(" + margin.left + "," + margin.top + ")");
   x.domain(d3.extent(mydata, function(d) {return d.time}));
   y.domain(d3.extent(mydata, function(d) {return d.price}));
   // Nest the entries by symbol
   var dataNest = d3.nest()
      .key(function(d) {return d.key;})
      .entries(mydata);
   // Loop through each symbol / key
   dataNest.forEach(function(d) {
      svg.append("path")
         .attr("class", "line")
         .attr("d", priceline(d.values));
   });

   // Add the X Axis
   svg.append("g")
      .attr("class", "axis")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x));
   // Add the Y Axis
   svg.append("g")
      .attr("class", "axis")
      .call(d3.axisLeft(y));
};

