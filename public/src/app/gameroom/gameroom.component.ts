import { Component, OnInit } from '@angular/core';
import { HttpService } from '../http.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-gameroom',
  templateUrl: './gameroom.component.html',
  styleUrls: ['./gameroom.component.css']
})
export class GameroomComponent implements OnInit {
  name = '';
  myId: number;
  socketId: string;
  allPlayers = [];
  isLeader = false;
  selected_cards = [];
  choosen_card = 1;
  state = {players: [{name: '', hand: []}, {name: '', hand: []}, {name: '', hand: []}, {name: '', hand: []}]};
  isActive = false;
  curround_card_value: number;
  winner: any;
  display_selected:any;
  card_names = ['dummy','aces','twos','threes','fours','fives','sixs','sevens','eights','nines','tens','jacks','queens','kings'];

  constructor(private _httpService: HttpService, private _router: Router) {
    _httpService.allPlayers$.subscribe(data => {
      this.allPlayers = data;
      for (const i in this.allPlayers) {
        if (this.allPlayers[i].name == this.name) {
          this.myId = Number(i);
          this.socketId = this.allPlayers[i]['socketid'];
        }
      }
      console.log('my ID is: ', this.myId);
      console.log('my SocketID is: ', this.socketId);
      // am I the leader?
      if (this.allPlayers[0]['socketid'] == this.socketId) {
        this.isLeader = true;
      }
    });
    _httpService.gameState$.subscribe(state => {
      console.log('subscribing to game state', state);
      this.state = state;
      // is there a winner?
      if (state.winner) {
        console.log('WE GOT A WINNER!!!!!', state.winner);
        this.winner = state.winner;
        this._router.navigate(['/stats']);
      }
      // am I the active player?
      if (this.state['active_player'] == this.myId) {
        this.isActive = true;
      } else {
        this.isActive = false;
      }
      // is there a curround card value?
      if (this.state['curround_card_value']) {
        this.curround_card_value = this.state['curround_card_value'];
        console.log('I am resetting curround_card_value: ', this.curround_card_value);
      } else {
        this.curround_card_value = null;
      }
    });
  }

  ngOnInit() {
    this.name = prompt('What is your name?');
    this.addPlayer(this.name);
    this.display_selected = {};
  }
  addPlayer(name) {
    this._httpService.addPlayer(name);
    this._httpService.getState();
  }
  startGame() {
    this.isLeader = false;
    this._httpService.startGame();
    this._httpService.getState();
  }
  callBluff() {
    this._httpService.callBluff();
    this._httpService.getState();
  }
  pass() {
    this._httpService.pass();
    this._httpService.getState();
  }
  selectCard(id) {
    let in_selected = false;
    for(var i of this.selected_cards){
      console.log("i:",i);
      if (i == id){
        in_selected = true;this.display_selected[id]=true;
      }
    }
    if(in_selected){
      var index = this.selected_cards.indexOf(id)
      if(index > -1){
        this.selected_cards.splice(index, 1);
        this.display_selected[id] = false;
      }
      console.log('removed card from selected. updated selection: ', this.selected_cards);
    } else {
      this.selected_cards.push(id);this.display_selected[id] = true;
      console.log('Ive selected these cards: ', this.selected_cards)
    }
  }
  play() {
    this._httpService.playCards(this.choosen_card, this.selected_cards);
    console.log('I chose this card value:', this.choosen_card);
    this.selected_cards = [];
    this._httpService.getState();
  }

}
