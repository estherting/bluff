const express = require('express');
const app = express();
const server = app.listen(8000);
const io = require('socket.io')(server);
var path = require("path");
var bodyParser = require('body-parser');

app.use(express.static(__dirname + "/public/dist/public"));
app.use(bodyParser.json());   // IMPORTANT!!!!!!!!!!!!!!!!!!!!!!!

// database
var players = []


require('./server/config/routes.js')(app, players);

app.all("*", (req,res,next) => {
  res.sendFile(path.resolve("./public/dist/public/index.html"))
});


io.on('connection', function (socket) {
  socket.emit('greeting', { msg: 'Greetings, from server Node, brought to you by Sockets! -Server' });
  socket.on('thankyou', function (data) {
    console.log(data.msg); //8 (note: this log will be on your server's terminal)
  });

  socket.on('addPlayer', function(data){
    players.push(data['name']);
    console.log('Added new player in players array in server', players)
    io.emit('addedPlayer', {players: players});

  })
  // socket.on('enter-game', function(){
  //   console.log('I am entering gameroom!')
  //   io.emit('addedPlayer', {players: players});
  // })

});
