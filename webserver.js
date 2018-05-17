var http = require('http').createServer(handler); //require http server, and create server with function handler()
var fs = require('fs'); //require filesystem module
var io = require('socket.io')(http) //require socket.io module and pass the http object (server)
var port = 8080;
var currentScores = {
  red: 0,
  blue: 0
};
var canScore = true;

function f(res) {
  return function (err, data) { //read file index.html in public folder
    if (err) {
          res.writeHead(404, {'Content-Type': 'text/html'}); //display 404 on error
          return res.end("404 Not Found");
        }
    res.writeHead(200, {'Content-Type': 'text/html'}); //write HTML
    res.write(data); //write data from index.html
    return res.end();
  }
}

function handler (req, res) { //create server
  console.log("requested: " + req.url);
  if (req.url.indexOf(".js") > 0 || req.url.indexOf(".css") > 0) {
    fs.readFile(__dirname + '/public/' + req.url, f(res));
  } else {
    fs.readFile(__dirname + '/public/index.html', f(res));
  }
}

io.sockets.on('connection', function (socket) {// WebSocket Connection
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
  socket.on('server', function(signal) { // get reset request from client
    if (!canScore) {
      return;
    }
    canScore = false;
    if (signal == '\u0020') {
      // red scored goal!
      currentScores.red = currentScores.red + 1;
      io.emit('server', currentScores);
      console.log("Red team scored");
    } else {
      // blue scored goal!
      currentScores.blue = currentScores.blue + 1;
      io.emit('server', currentScores);
      console.log("Blue team scored");
    }
    setTimeout(function() { canScore = true; }, 2500);
  });
});

http.listen(port);
console.log("Server listening on port: " + port);
