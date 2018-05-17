(function() {

var init = true;
var audio = null;
var scoreScreen = true;

var socket = io(); //load socket.io-client and connect to the host that serves the page
window.addEventListener("load", function(){ //when page loads
  var button = document.getElementById("button");
  button.addEventListener('click', function() { //add event listener for when button is clicked
    init = true;
    socket.emit("client", "reset"); //send reset request. UI will be updated when websocket receives notification
    document.getElementById("winScreen").style.display = "none";
    document.getElementById("scoreScreen").style.display = "block";
    stopSound();
    scoreScreen = true;
  });
});

function stopSound() {
  audio && audio.pause();
}

function playSound(file) {
  stopSound();
  audio = new Audio(file);
  audio.play();
}

socket.on('server', function (data) { // display current scores
  if (!init) {
    playSound('goal.wav');
  }
  init = false;
  document.getElementById("red").className = "team score" + data.red;
  document.getElementById("blue").className = "team score" + data.blue;
});

socket.on('win', function (data) { // display win screen
  console.log(data.team + " won the game!");
  document.getElementById("winScreen").style.display = "table";
  document.getElementById("winText").style.color = data.red ? "red" : "blue";
  document.getElementById("winText").innerText = data.team + " team won!";
  document.getElementById("scoreScreen").style.display = "none";
  scoreScreen = false;
  playSound('congrats.wav');
});

socket.emit("client", "update"); // ask for current score
})();
