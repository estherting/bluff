class Card{
    constructor(suit, name, value, cardid, img){
        this.suit = suit
        this.name = name
        this.value = value
        this.cardid = cardid
        this.img = img
    }
    show() {
        console.log("Suit: " + this.suit + ", Name: " + this.name + ", value: " + this.value)
    }
}
class Deck{
    constructor(startid){
        this.cards = this.reset(startid)
        this.numCardsLeft = 0
    }
    shuffle() {
        let d = this.cards;
        for(let end = this.cards.length - 1; end > 0; end--){
            let rdx = Math.floor(Math.random()* (end +1));
            let t = d[end]
            d[end] = d[rdx]
            d[rdx] = t
        }
        return this
    }

    reset(startid) {
        let results = []
        let names = ['ace','two','three','four','five','six','seven','eight','nine','ten','jack','queen','king']
        let suits = ["Hearts", "Clubs", "Spades", "Diamonds"]
        suits.forEach(suit=>{
            names.forEach((name,idx)=>{
                let newCard = new Card(suit, name, idx + 1, startid, (idx+1) + suit[0])
                results.push(newCard)
                startid++;
            }
        )})
        return results

    }
    deal() {
        var n = this.cards.length
        var i = Math.floor(Math.random()*n--);
        var dealtCard = this.cards.splice(i,1)[0]
        return dealtCard
    }
}
class Player {
    constructor(name, socketid){
        this.name = name
        this.socketid = socketid
        this.hand = []
    }
    draw(deck) {
        this.hand.push(deck.deal())
        return this;
    }
    discard(cardid){
        for(var i in this.hand){
            if (this.hand[i].cardid == cardid){
                let card = this.hand.splice(i, 1)[0]
                return card
            }
        }
    }
    drophand(){
        this.hand = [];
    }
}

class Bluff {
    constructor(){
        this.startid = 0;
        this.deck = null
        //this.deck.shuffle()
        this.state = {
            players:[],
            watchers:[],
            //array of objects
            curround_plays:[],
            most_recent_hand:{
                isbluff: false,
                cards:[],
                player:null
            },
            curround_card_value: null,
            gameon: false,
            //use players index to find the active player
            active_player: null,
            winner:null
        }
    }
    add(player){
        this.state.players.push(player);
    }
    addWatcher(watcher){
        this.state.watchers.push(watcher);
    }
    //probably still needs more work
    deal(){
        var len = Math.floor(this.deck.cards.length / this.state.players.length)
        for(var player of this.state.players){
            for(var i = 0;i < len; i++){
                player.draw(this.deck)
            }
        }
    }
    start(){
        this.deck = new Deck(this.startid)
        this.deck.shuffle()
        this.deal()
        this.state.gameon = true;
        this.state.active_player = 0;
        this.state.winner = null;
    }
    endGame(){
        this.startid = 0;
        this.deck = null
        this.state.curround_plays=[]
        this.state.most_recent_hand = {
            isbluff: false,
            cards:[],
            player:null
        }
        this.state.curround_card_value = null
        this.state.gameon = false
        this.state.active_player = null
        for(let player of this.state.players){
            player.drophand()
        }
    }

}

module.exports = {
    Player:Player,
    Card:Card,
    Deck:Deck,
    Bluff:Bluff
}
