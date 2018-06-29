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

var card_names = ['dummy', 'aces', 'twos', 'threes', 'fours', 'fives', 'sixs', 'sevens', 'eights', 'nines', 'tens', 'jacks',
    'queens', 'kings'];
var bluff = new Bluff()
// var recent_hand = bluff.state.most_recent_hand
// var state = bluff.state
// var current_round_plays = bluff.state.curround_plays
// var players = bluff.state.players

io.on('connection',function(socket){
    var thisPlayer
    //So over here we are getting the player name, and storing it in this socket connection
    //we also send the socket.id back to the client so that he knows what his socket.id is.
    //we will use the socket.id later for comparing users.
    io.emit("player_list",bluff.state.players)

    socket.on("player_name",function(name){
        thisPlayer = name
        socket.emit("yourid",socket.id)
        let newPlayer = new Player(name, socket.id)
        //if the game isn't on (when gameon is false) then feel free to add a new player to the player

        //list, and then have the server let everyone know (emit to all) what the new player_list is
        if(!bluff.state.gameon){
            console.log(name,"is now playing");
            bluff.add(newPlayer)
            io.emit("player_list",bluff.state.players)
        //else if the game is on (when gameon is true) then we should update the game watcher list
        //and not add them to the player list
        //unclear if we should just emit to the watcher the game_state, or maybe emit that a new watcher
        //has joined or whatever
        }else{
            //pseudo: add player to a list
            console.log(name,"is now watching");
            bluff.addWatcher(newPlayer);
            let message = name + ' started watching the game';
            let game_hist = {
                message : message
            }
            bluff.state.game_history.push(game_hist);
            socket.emit("game_state",bluff.state);
        }

        //if there is only one player, make him the leader
        // -----------------------> i think this code here might be breaking the game
        if(bluff.state.players.length && bluff.state.players[0].socketid == socket.id){
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
        let message = 'Game has started';
        let game_hist = {
            message: message
        }
        bluff.state.game_history.push(game_hist);
        for(let player of bluff.state.players){
            let message = player.name + ' is playing';
            let game_hist = {
                message: message
            }
            bluff.state.game_history.push(game_hist);
        }
        io.emit("game_state",bluff.state)
    })

    //---------------------->this section here deals with the game logic

    socket.on('callbluff',function(d){
        console.log("person called bluff");
        let message = bluff.state.players[bluff.state.active_player].name + ' has called bluff';
        let game_hist = {
            message: message
        }
        bluff.state.game_history.push(game_hist);
        let losershand = [];
        if(bluff.state.most_recent_hand.isbluff){
            losershand = bluff.state.players[bluff.state.most_recent_hand.player].hand
            let message = bluff.state.players[bluff.state.most_recent_hand.player].name + ' was called out on his bluff';
            let game_hist = {
                message: message
            }
            bluff.state.game_history.push(game_hist);
        }else{
            losershand = bluff.state.players[bluff.state.active_player].hand
            let message = bluff.state.players[bluff.state.active_player].name + ' was wrong';
            let game_hist = {
                message: message
            }
            bluff.state.game_history.push(game_hist);
            bluff.state.active_player = bluff.state.most_recent_hand.player
        }
        for (var play of bluff.state.curround_plays){
            losershand.push.apply(losershand, play.cards)
        }
        //consider turning this into a function for more readability later
        bluff.state.curround_plays = []
        bluff.state.most_recent_hand = {
            isbluff: false,
            cards:[],
            player:null
        }
        bluff.state.curround_card_value = null
        //io.emit("game_state",bluff.state)
        let winner = checkwin(bluff.state)
        if(winner){
            //io.emit("winner",winner)
            //instead lets update the game state
            //may have to remove winner on reset
            bluff.state.winner = winner
            io.emit("game_state",bluff.state)
            bluff.endGame()
            io.emit("player_list",bluff.state.players)
            //marked for later
            if(bluff.state.players[0]){
                socket.broadcast.to(bluff.state.players[0].socketid).emit("isleader","hey you are the leader of this game")
            }
        }else{
            io.emit("game_state",bluff.state)
        }
    })
    socket.on('pass',function(d){
        console.log("person wants to pass");
        let message = bluff.state.players[bluff.state.active_player].name + ' has Passed';
        let game_hist = {
            message: message
        }
        bluff.state.game_history.push(game_hist);
        if (bluff.state.active_player == bluff.state.most_recent_hand.player){
            //can change it if we want the player who started the round to go again
            bluff.state.active_player = (bluff.state.curround_plays[0].player + 1) % bluff.state.players.length
            bluff.state.curround_plays = []
            bluff.state.most_recent_hand = {
                isbluff: false,
                cards:[],
                player:null
            }
            bluff.state.curround_card_value = null
            let winner = checkwin(bluff.state)
            if(winner){
                //io.emit("winner",winner)
                //instead lets add winner to the game state
                bluff.state.winner = winner
                io.emit("game_state",bluff.state)
                bluff.endGame()
                io.emit("player_list",bluff.state.players)
                //marked for later observation
                if(bluff.state.players[0]){
                    socket.broadcast.to(bluff.state.players[0].socketid).emit("isleader","hey you are the leader of this game")
                }
            }else{
                io.emit("game_state",bluff.state)
            }
        }else{
            bluff.state.active_player = (bluff.state.active_player + 1) % bluff.state.players.length
            io.emit("game_state",bluff.state)
        }

    })

    socket.on('play',function(data){
        console.log("player wants to play some stuff");
        bluff.state.most_recent_hand = {
            isbluff: false,
            cards:[],
            player:null
        }
        //Check to see if the current round card value has been already set. If not, then set it.
        if (!bluff.state.curround_card_value){
            bluff.state.curround_card_value = data.choosen_card
        }
        for(var i in data.selected_cards){
            let curcard = bluff.state.players[bluff.state.active_player].discard(data.selected_cards[i])
            if(curcard.value != bluff.state.curround_card_value){
                bluff.state.most_recent_hand.isbluff = true;
            }
            bluff.state.most_recent_hand.cards.push(curcard)
        }

        bluff.state.most_recent_hand.player = bluff.state.active_player
        bluff.state.curround_plays.push(bluff.state.most_recent_hand)
        let message = bluff.state.players[bluff.state.active_player].name + ' has played ';
        message = message + data.selected_cards.length + ' ' + card_names[bluff.state.curround_card_value];
        let game_hist = {
            message: message
        }
        bluff.state.game_history.push(game_hist);
        bluff.state.active_player = (bluff.state.active_player + 1) % bluff.state.players.length
        io.emit("game_state",bluff.state)
    })


    //seems like a lot of problems occur here in the disconnect
    //a quick fix would be to just set the active_player to the player at index 0
    //instead of trying to do the next player
    socket.on('disconnect',function(){
        for(let i in bluff.state.players){
            if(bluff.state.players[i].socketid == socket.id){
                if(bluff.state.active_player == i){
                    bluff.state.active_player = (bluff.state.active_player +1) % (bluff.state.players.length -1)

                }

                let message = bluff.state.players.splice(i, 1)[0].name + ' has left the game';
                let game_hist = {
                    message: message
                }
                bluff.state.game_history.push(game_hist);
                if(i == 0 && !bluff.state.gameon){
                    socket.broadcast.to(bluff.state.players[0].socketid).emit("isleader","hey you are the leader of this game")
                }
                break;
            }
        }
        //initial attempt to deal with players leaving early
        if(bluff.state.gameon){
            io.emit("game_state",bluff.state)
        }else{
            io.emit("player_list",bluff.state.players)
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
