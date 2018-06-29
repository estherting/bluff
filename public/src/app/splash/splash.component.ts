import { Component, OnInit, Input, Output , EventEmitter} from '@angular/core';
import * as THREE from '../../assets/build/three';
import { HttpService } from '../http.service';
import { ActivatedRoute, Router } from '@angular/router';
// import { ISubscription } from "rxjs/Subscription";


@Component({
  selector: 'app-splash',
  templateUrl: './splash.component.html',
  styleUrls: ['./splash.component.css']
})
export class SplashComponent implements OnInit {
  @Output() startEvent = new EventEmitter();
  playerName = '';
  socketId = '';
  allPlayers = [];
  joined = false;
  isLeader = false;
  gameStarted = false;
  state: any;
  // private gameSub: ISubscription;
  /* table:any;

  camera:any
  scene:any
  renderer:any;
  controls:any;

  objects:any;
  targets:any; */
  constructor(private _httpService: HttpService, private _router: Router) {
    this.playerName = '';
    this.socketId = '';
    this.allPlayers = [];
    this.joined = false;
    this.isLeader = false;
    this.gameStarted = false;
    this.state = null;
    _httpService.allPlayers$.subscribe(players => {
      console.log('inside allplayers subscription')
      this.allPlayers = players;
      for (const i in this.allPlayers) {
        if (this.allPlayers[i].name == this.playerName) {
          this.socketId = this.allPlayers[i]['socketid'];
        }
      }
      // Am I the leader?
      if (this.allPlayers.length) {
        if (this.allPlayers[0]['socketid'] == this.socketId) {
          this.isLeader = true;
        }
        console.log('am I the leader?', this.isLeader);
      }
    });
/*     _httpService.gameState$.subscribe(state => {
      console.log('subscribing to game state', state);
      this.state = state;
       if (state.gameon) {
        _router.navigate(['/gameroom']);
      } 
    }); */
  }

  ngOnInit() {
   /*  this.table = [];
    this.objects = [];
    this.targets = { table: [], sphere: [], helix: [], grid: [] };
    this.init();
		this.animate(); */
  }
 /*  */
  joinGame() {
    this.joined = true;
    this._httpService.addPlayer(this.playerName);
  }
  startGame() {
    this.startEvent.emit();
  }

  // ngOnDestroy(){
  //   this.gameSub.unsubscribe()
  // }
}
