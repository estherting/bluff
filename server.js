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
var recent_hand = bluff.state.most_recent_hand
var state = bluff.state
var current_round_plays = bluff.state.curround_plays
var players = bluff.state.players

io.on('connection',function(socket){
    var thisPlayer
    //So over here we are getting the player name, and storing it in this socket connection
    //we also send the socket.id back to the client so that he knows what his socket.id is.
    //we will use the socket.id later for comparing users.
    socket.on("player_name",function(name){
        thisPlayer = name
        socket.emit("yourid",socket.id)
        let newPlayer = new Player(name, socket.id)
        //if the game isn't on (when gameon is false) then feel free to add a new player to the player
        //list, and then have the server let everyone know (emit to all) what the new player_list is
        if(!state.gameon){
            console.log(name,"is now playing");
            bluff.add(newPlayer)
            io.emit("player_list",players)
        //else if the game is on (when gameon is true) then we should update the game watcher list
        //and not add them to the player list
        //unclear if we should just emit to the watcher the game_state, or maybe emit that a new watcher
        //has joined or whatever
        }else{
            //pseudo: add player to a list
            console.log(name,"is now watching");
            bluff.addWatcher(newPlayer)
            socket.emit("game_state",state)
        }

        //if there is only one player, make him the leader
        // -----------------------> i think this code here might be breaking the game
        if(players[0].socketid == socket.id){
            socket.emit("isleader","hey you are the leader of this game")
        }
    })
    //When the leader of the game clicks startgame run the start method of bluff
    //  --will make a new deck and shuffle it
    //  --deal out the cards
    //  --set the gameon to true
    //  --set the active_player as the first person in the players array
    //then emit the new game_state
    socket.on('startgame',function(d){
        bluff.start()
        io.emit("game_state",bluff.state)
    })

    //---------------------->this section here deals with the game logic

    socket.on('callbluff',function(d){
        console.log("person called bluff");
        let losershand
        if(recent_hand.isbluff){
            losershand = players[recent_hand.player].hand

        }else{
            losershand = players[state.active_player].hand
            state.active_player = recent_hand.player
        }
        for(var play of current_round_plays){
            losershand.push.apply(losershand, play.cards)
        }
        //consider turning this into a function for more readability later
        current_round_plays = []
        recent_hand = {
            isbluff: false,
            cards:[],
            player:null
        }
        bluff.state.curround_card_value = null
        //io.emit("game_state",bluff.state)
        let winner = checkwin(bluff.state)
        if(winner){
            io.emit("winner",winner)
            bluff.endGame()
            io.emit("player_list",players)
            //marked for later
            if(players[0]){
                socket.broadcast.to(players[0].socketid).emit("isleader","hey you are the leader of this game")
            }
        }else{
            io.emit("game_state",bluff.state)
        }
    })
    socket.on('pass',function(d){
        console.log("person wants to pass");
        if(state.active_player == recent_hand.player){
            //can change it if we want the player who started the round to go again
            state.active_player = (current_round_plays[0].player + 1) % players.length
            current_round_plays = []
            recent_hand = {
                isbluff: false,
                cards:[],
                player:null
            }
            bluff.state.curround_card_value = null
             let winner = checkwin(bluff.state)
            if(winner){
                io.emit("winner",winner)
                bluff.endGame()
                io.emit("player_list",players)
                //marked for later observation
                if(players[0]){
                    socket.broadcast.to(players[0].socketid).emit("isleader","hey you are the leader of this game")
                }
            }else{
                io.emit("game_state",bluff.state)
            }
        }else{
            state.active_player = (state.active_player + 1) % players.length
            io.emit("game_state",bluff.state)
        }

    })

    socket.on('play',function(data){
        console.log("player wants to play some stuff");
        recent_hand = {
            isbluff: false,
            cards:[],
            player:null
        }
        //can do a check here for curround_card_value
        bluff.state.curround_card_value = data.choosen_card
        for(var i in data.selected_cards){
            curcard = players[state.active_player].discard(data.selected_cards[i])
            if(curcard.value != bluff.state.curround_card_value){
                recent_hand.isbluff = true;
            }
            recent_hand.cards.push(curcard)
        }
        recent_hand.player = state.active_player
        current_round_plays.push(recent_hand)

        state.active_player = (state.active_player + 1) % players.length

        io.emit("game_state",bluff.state)
    })

    socket.on('disconnect',function(){
        for(let i in players){
            if(players[i].socketid == socket.id){
                if(state.active_player == i){
                    state.active_player = (state.active_player +1) % (players.length -1)
                }
                players.splice(i,1)
                if(i == 0 && !bluff.state.gameon){
                    socket.broadcast.to(players[0].socketid).emit("isleader","hey you are the leader of this game")
                }
                break;
            }
        }
        //initial attempt to deal with players leaving early
        if(bluff.state.gameon){
            io.emit("game_state",bluff.state)
        }else{
            io.emit("player_list",players)
        }
    })
})

function checkwin(state){
    for(let player of state.players){
        if(player.hand.length == 0){
            return player
        }
    }
    return null
}
