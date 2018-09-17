import { NgModule }             from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { MainComponent } from './main/main.component';
import { DatabaseComponent } from './database/database.component';

const routes: Routes = [
  { path: '', component: MainComponent },
  { path: 'database', component: DatabaseComponent },
  { path: '**', redirectTo: '' },
];

@NgModule({
  imports: [ RouterModule.forRoot(routes) ],
  exports: [ RouterModule ]
})
export class AppRoutingModule {}
