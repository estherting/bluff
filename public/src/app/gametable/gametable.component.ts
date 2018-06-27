import { Component, OnInit } from '@angular/core';
import { HttpService } from '../http.service';

@Component({
  selector: 'app-gametable',
  templateUrl: './gametable.component.html',
  styleUrls: ['./gametable.component.css']
})
export class GametableComponent implements OnInit {
  players: any;
  constructor(private _httpService: HttpService) {
  }

  ngOnInit() {
    // this.players = this._httpService.players;
  }

}
