import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpService } from './http.service';
import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { GameroomComponent } from './gameroom/gameroom.component';
import { StatsComponent } from './stats/stats.component';
import { SplashComponent } from './splash/splash.component';
import { GametableComponent } from './gametable/gametable.component';

@NgModule({
  declarations: [
    AppComponent,
    GameroomComponent,
    StatsComponent,
    SplashComponent,
    GametableComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule
  ],
  providers: [HttpService],
  bootstrap: [AppComponent]
})
export class AppModule { }
