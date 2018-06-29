import { Component } from '@angular/core';



@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'app';
  showSplash = false;
  showGame = false;
  showStats = true;

  startGame() {
    console.log("AppComponent:", this.showSplash);

    this.showSplash = true;
    console.log("AppComponent:", this.showSplash);
    this.showGame = true;
  }
}
