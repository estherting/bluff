import { Component, OnInit } from '@angular/core';
import { HttpService } from '../http.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-gameroom',
  templateUrl: './gameroom.component.html',
  styleUrls: ['./gameroom.component.css']
})
export class GameroomComponent implements OnInit {
  name = ""
  myId: number;
  allPlayers = [{name: ""}];
  isLeader = false;
  selected_cards = [];
  choosen_card = "10"
  state = {players: [{name: "", hand:[]}]};
  isActive = false;


  constructor(private _httpService: HttpService, private _router: Router) {
    _httpService.allPlayers$.subscribe(data => {
      console.log('lets see if it works, it should be an array', data);
      this.allPlayers = data;
      for(let i in this.allPlayers){
        if(this.allPlayers[i].name == this.name){
          this.myId = Number(i);
        }
      }
      console.log('my ID is: ', this.myId);
      if(this.allPlayers.length == 1){
        this.isLeader = true;
      }
    })
    _httpService.gameState$.subscribe(state => {
      console.log('subscribing to game state', state);
      this.state = state;
      if(this.state['active_player'] == this.myId){
        this.isActive = true;
      } else {
        this.isActive = false;
      }
    })
  }

  ngOnInit() {
    this.name = prompt('What is your name?')
    this.addPlayer(this.name);
  }
  addPlayer(name){
    this._httpService.addPlayer(name);
    this._httpService.getState();
  }
  startGame(){
    this.isLeader = false;
    this._httpService.startGame();
    this._httpService.getState();
  }
  callBluff(){
    this._httpService.callBluff();
    this._httpService.getState();
  }
  pass(){
    this._httpService.pass();
    this._httpService.getState();
  }
  selectCard(id){
    let in_selected = false;
    for(var i of this.selected_cards){
      if (i == id){
        in_selected = true;
      }
    }
    if(in_selected){
      var index = this.selected_cards.indexOf(id)
      if(index > -1){
        this.selected_cards.splice(index, 1)
      }
      console.log('removed card from selected. updated selection: ', this.selected_cards)
    } else {
      this.selected_cards.push(id);
      console.log('Ive selected these cards: ', this.selected_cards)
    }
  }
  play(){
    this._httpService.playCards(this.choosen_card, this.selected_cards);
    this.selected_cards = []
    this._httpService.getState();
  }

}
