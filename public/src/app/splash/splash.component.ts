import { Component, OnInit } from '@angular/core';
import * as THREE from '../../assets/build/three';
import { HttpService } from '../http.service';


@Component({
  selector: 'app-splash',
  templateUrl: './splash.component.html',
  styleUrls: ['./splash.component.css']
})
export class SplashComponent implements OnInit {
  playerName = "";
  socketId = "";
  allPlayers = [];
  joined = false;
  isLeader = false;
  gameStarted = false;
  /* table:any;

  camera:any
  scene:any
  renderer:any;
  controls:any;

  objects:any;
  targets:any; */
  constructor(private _httpService: HttpService) {
    _httpService.allPlayers$.subscribe(players => {
      console.log('inside allplayers subscription')
      this.allPlayers = players;
      for (const i in this.allPlayers) {
        if (this.allPlayers[i].name == this.playerName) {
          this.socketId = this.allPlayers[i]['socketid'];
        }
      }
      // Am I the leader?
      if(this.allPlayers.length) {
        if (this.allPlayers[0]['socketid'] == this.socketId) {
          this.isLeader = true;
        }
        console.log('am I the leader?', this.isLeader)
      }
    })
  }

  ngOnInit() {
   /*  this.table = [];
    this.objects = [];
    this.targets = { table: [], sphere: [], helix: [], grid: [] };
    this.init();
		this.animate(); */
  }
 /*  */
  joinGame(){
    this.joined = true;
    this._httpService.addPlayer(this.playerName);
  }
  startGame() {
    // this.isLeader = false;
    this._httpService.startGame();
    this._httpService.getState();
  }
}
