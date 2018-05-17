(function() {

var redScore = 0;
var blueScore = 0;

var socket = io(); //load socket.io-client and connect to the host that serves the page
window.addEventListener("load", function(){ //when page loads
  var button = document.getElementById("button");
  button.addEventListener('click', function() { //add event listener for when button is clicked
        socket.emit("client", "reset"); //send reset request. UI will be updated when websocket receives notification
  });
});

socket.on('server', function (data) { // display current scores
  document.getElementById("redScore").innerText = data.red;
  document.getElementById("blueScore").innerText = data.blue;
});

socket.emit("client", "update"); // ask for current score
})();
