import { Injectable, EventEmitter } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import * as io from 'socket.io-client';
import { Subject } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class HttpService {
  private socket: SocketIOClient.Socket; // the client instance of socket.io
  private allPlayersSource = new Subject<any>();
  private gameStateSource = new Subject<any>();
  private winSource = new Subject<any>();
  allPlayers$ = this.allPlayersSource.asObservable();
  gameState$ = this.gameStateSource.asObservable();
  win$ = this.winSource.asObservable();
  id: any;


  constructor(private _http: HttpClient) {
    this.socket = io();
    // this.socket.on('game_state', function(state){
    //   this.gameStateSource.next(state)
    // }.bind(this))
  }

  addPlayer(name) {
    this.socket.emit('player_name', name);
    this.socket.on('yourid',(socketid)=>{
      this.id = socketid
      console.log(this.id);
    })

    this.socket.on("player_list",function(data){
      console.log('got our player list: ', data);
      this.allPlayersSource.next(data)
      // var cstr = ""
      // for(let player of data){
      //     cstr += `<div id = '${player.socketid}'><h1>${player.name}</h1></div>`
      // }
      // $('.players').html(cstr)
    }.bind(this))
  }

  startGame(){
    this.socket.emit("startgame","whatever data here")
    console.log('starting game!')
  }
  callBluff(){
    this.socket.emit('callbluff','dummy data')
    console.log('calling bluff!')
  }
  pass(){
    this.socket.emit('pass','dummy data')
    console.log('I pass!')
  }
  getState(){
    this.socket.on('game_state', function(state){
      this.gameStateSource.next(state)
    }.bind(this))
  }
  playCards(choosen_card, selected_cards){
    this.socket.emit('play',{
        choosen_card: choosen_card,
        selected_cards: selected_cards
    })
  }
  winner(){
    this.socket.on('winnner', function(winner){
      this.winSource.next(winner)
    })
  }
}
