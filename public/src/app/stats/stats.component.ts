import { Component, OnInit } from '@angular/core';
import { HttpService } from '../http.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-stats',
  templateUrl: './stats.component.html',
  styleUrls: ['./stats.component.css']
})
export class StatsComponent implements OnInit {
  winner: any;
  successful_bluffs: any;
  bluffs_caught: any;
  placement = [];

  constructor(private _httpService: HttpService, private _router: Router) {
    console.log('i am in constructor')
    this.winner = _httpService.winner
    _httpService.gameState$.subscribe(state => {
      this.placement.push(this.winner)

    })
  }

  ngOnInit() {
  }

}
