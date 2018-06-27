const Deck = require('./deck_of_cards').Deck
const Player = require('./deck_of_cards').Player
const Card = require('./deck_of_cards').Card
const Bluff = require('./deck_of_cards').Bluff

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


var bluff = new Bluff()

io.on('connection',function(socket){
    var thisPlayer
    //adding player name
    socket.on("player_name",function(name){
        thisPlayer = name
        bluff.add(new Player(name, socket.id))

        socket.emit("yourid",socket.id)

        //let all players know that this player has joined the game
        io.emit("player_list",bluff.state.players)

        //if there is only one player, make him the leader
        if(bluff.state.players[0].socketid == socket.id){
            socket.emit("isleader","hey you are the leader of this game")
        }
    })

    socket.on('startgame',function(d){
        bluff.start()
        io.emit("game_state",bluff.state)
    })

    socket.on('callbluff',function(d){
        console.log("person called bluff");
    })

    socket.on('pass',function(d){
        console.log("person wants to pass");
    })

    socket.on('play',function(data){
        bluff.state.most_recent_hand = {
            isbluff: false,
            cards:[],
            player:null
        }
        //can do a check here for curround_card_value
        bluff.state.curround_card_value = data.choosen_card
        for(var i in data.selected_cards){
            curcard = bluff.state.players[bluff.state.active_player].discard(data.selected_cards[i])
            if(curcard.value != bluff.state.curround_card_value){
                bluff.state.most_recent_hand.isbluff = true;
            }
            bluff.state.most_recent_hand.cards.push(curcard)
        }
        bluff.state.most_recent_hand.player = bluff.state.active_player
        bluff.state.curround_plays.push(bluff.state.most_recent_hand)

        bluff.state.active_player = (bluff.state.active_player + 1) % bluff.state.players.length

        console.log(bluff.state.players[0].hand.length)
        io.emit("game_state",bluff.state)
    })

    socket.on('disconnect',function(){
        for(let i in bluff.state.players){
            if(bluff.state.players[i].socketid == socket.id){
                bluff.state.players.splice(i,1)
                break;
            }
        }
        io.emit("player_list",bluff.state.players)
    })
})
