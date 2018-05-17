var http = require('http').createServer(handler); //require http server, and create server with function handler()
var fs = require('fs'); //require filesystem module
var io = require('socket.io')(http) //require socket.io module and pass the http object (server)
var port = 8080;
var currentScores = {
  red: 0,
  blue: 0
};
var canScore = true;
var blueTeamName = "Blue";
var redTeamName = "Red";
var timeBetweenGoals = 50; // TODO set to 2000

function f(res, type) {
  return function (err, data) { //read file index.html in public folder
    if (err) {
          res.writeHead(404, {'Content-Type': 'text/html'}); //display 404 on error
          return res.end("404 Not Found");
        }
    res.writeHead(200, {'Content-Type': type}); //write HTML
    res.write(data); //write data from index.html
    return res.end();
  }
}

function handler (req, res) { //create server
  console.log("requested: " + req.url);
  if (req.url.indexOf(".js") > 0 || req.url.indexOf(".css") > 0) {
    fs.readFile(__dirname + '/public/' + req.url, f(res, 'text/html'));
  } else if (req.url.indexOf(".jpg") > 0) {
    fs.readFile(__dirname + '/public/' + req.url, f(res, 'image/jpg'));
  } else if (req.url.indexOf(".png") > 0) {
    fs.readFile(__dirname + '/public/' + req.url, f(res, 'image/png'));
  } else if (req.url.indexOf(".wav") > 0) {
    fs.readFile(__dirname + '/public/' + req.url, f(res, 'audio/wav'));
  } else {
    fs.readFile(__dirname + '/public/index.html', f(res, 'text/html'));
  }
}

io.sockets.on('connection', function (socket) {// WebSocket Connection
  console.log("[New connection]");
  socket.on('client', function(request) { // get reset request from client
    if (request == "reset") {
      currentScores.red = 0;
      currentScores.blue = 0;
      socket.emit('server', currentScores);
    } else if (request == "update") {
      socket.emit('server', currentScores);
    } else {
      console.log("Unknown request from client : " + request);
    }
  });
  socket.on('incbluescore', function(signal) { // get reset request from client
    if (!canScore) {
      return;
    }
    canScore = false;
    // blue scored goal!
    console.log("Blue team scored");
    if (currentScores.blue >= 9) {
      data = {
        team: blueTeamName || "Blue"
      };
      io.emit('win', data);
    } else {
      currentScores.blue = currentScores.blue + 1;
      io.emit('server', currentScores);
    }
    setTimeout(function() { canScore = true; }, timeBetweenGoals);
  });
  socket.on('incredscore', function(signal) { // get reset request from client
    if (!canScore) {
      return;
    }
    canScore = false;
    // Red scored goal!
    console.log("Red team scored");
    if (currentScores.red >= 9) {
      data = {
        team: redTeamName || "Red",
        red: true
      };
      io.emit('win', data);
    } else {
      currentScores.red = currentScores.red + 1;
      io.emit('server', currentScores);
    }
    setTimeout(function() { canScore = true; }, timeBetweenGoals);
  });
});

http.listen(port);
console.log("Server listening on port: " + port);
