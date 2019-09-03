window.onload = function() {
   //sqlite3 -header -column shares.db 'select Price,Rate,Crus_GBP from Shares;'
   //d3.selectAll("p").style("color", "blue");
   //https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=CRUS&apikey=<apikey>
   url = "https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=CRUS&apikey="+apikey;
   url = "https://www.alphavantage.co/query?function=CURRENCY_EXCHANGE_RATE&from_currency=USD&to_currency=GBP&apikey="+apikey;
   url = "https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=CRUS&interval=5min&apikey="+apikey;
   url2 = "https://www.alphavantage.co/query?function=FX_INTRADAY&from_symbol=USD&to_symbol=GBP&interval=5min&apikey="+apikey;

   var xmlhttp = new XMLHttpRequest();
   xmlhttp.onreadystatechange = create_graph;
   xmlhttp.open("GET", url, true);
   xmlhttp.send();
   var xmlhttp2 = new XMLHttpRequest();
   xmlhttp2.onreadystatechange = create_graph;
   xmlhttp2.open("GET", url2, true);
   xmlhttp2.send();

}
function create_data(json_input) {
   //create empty hash to fill up
   var data_array = [];
   for (var key in json_input) {
      if (!json_input.hasOwnProperty(key)) continue;
      //Skip the metadata
      if (key === "Meta Data") continue;
      var obj = json_input[key]
      //Now we have the time series we need to iterate through all the keys in here
      for (var timestamp in obj) {
         var data_hash = {};
         //skip if property is from prototype
         if (!obj.hasOwnProperty(timestamp)) continue;
         data_hash["time"]    = timestamp;
         data_hash["price"]   = obj[timestamp]["4. close"];
         data_array.push(data_hash)
      }
   }
   console.log(data_array)
   return data_array;
}

function create_graph() {
   if (this.readyState == 4 && this.status == 200) {
      var myObj = JSON.parse(this.responseText);
      //document.getElementById("demo").innerHTML = myObj.name;
      console.log(myObj);
      mydata = create_data(myObj);

      var parseDate = d3.timeParse("%Y-%m-%d %H:%M:%S");
      mydata.forEach(function(d) {
         d.time = parseDate(d.time);
         d.price = +d.price;
      });
      console.log(mydata);
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
         .key(function(d) {return "CRUS";})
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
   }
};

