import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SplashComponent } from './splash/splash.component';
import { GameroomComponent } from './gameroom/gameroom.component';
import { StatsComponent } from './stats/stats.component';
import { AppComponent } from './app.component';

const routes: Routes = [
  { path: '', pathMatch: 'full', component: AppComponent },
  // { path: '**', component: PageNotFoundComponent },
  { path: 'splash', component: SplashComponent },
  { path: 'gameroom', component: GameroomComponent },
  { path: 'stats', component: StatsComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
