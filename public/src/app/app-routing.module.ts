import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SplashComponent } from './splash/splash.component';
import { GameroomComponent } from './gameroom/gameroom.component';
import { GametableComponent } from './gametable/gametable.component';
import { StatsComponent } from './stats/stats.component';

const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: '/splash' },
  // { path: '**', component: PageNotFoundComponent },
  { path: 'splash', component: SplashComponent },
  { path: 'gameroom', component: GameroomComponent, children: [
    { path: 'gametable', component: GametableComponent },
  ] },
  { path: 'stats', component: StatsComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
