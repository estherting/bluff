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
  allPlayers = [{name: ""}];
  isLeader = false;
  selected_cards = [];

  constructor(private _httpService: HttpService, private _router: Router) {
    _httpService.allPlayers$.subscribe(name => {
      console.log('lets see if it works, it should be an array', name);
      this.allPlayers = name;
      if(this.allPlayers.length == 1){
        this.isLeader = true;
      }
    })
  }

  ngOnInit() {
    this.name = prompt('What is your name?')
    this.addPlayer(this.name);
  }
  addPlayer(name){
    this._httpService.addPlayer(name);
  }
  startGame(){
    this.isLeader = false;
    this._httpService.startGame();
  }
  callBluff(){
    this._httpService.callBluff();
  }
  pass(){
    this._httpService.pass();
  }
  play(){
    this._httpService.playCards();
  }

}
