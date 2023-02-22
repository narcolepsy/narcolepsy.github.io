//Little scraper for the traffic scotland webcams
var loaded = 0;
eval("apikey = \"" + getQueryVariable("apikey")+ "\"");
console.log(apikey);
window.onload = function() {
   url = "https://trafficscotland.org/components/livetrafficcameras/ajax/levcameraview.aspx?cam=299&sessionStartTime=1612457221"

   console.log(url);
   populateLink(); 
   console.log("Ran populateLink()");
   //get_camera("299", Math.floor(Date.now()/1000), add_to_table);
}
function populateLink() {
   //alert("here i am")
   console.log("Running populateLink()")
   document.getElementById('cam1').src = "https://trafficscotland.org/components/livetrafficcameras/ajax/levcameraview.aspx?cam=299&sessionStartTime=1612457221"
   loaded = 1;
}

var c_work_to_home = [214, 213, 212, 211, 210, 209];
