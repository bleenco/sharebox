import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { BrowseComponent } from './browse/browse.component';

const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'browse' },
  { path: 'browse', children: [ { path: '**', component: BrowseComponent } ] }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes)
  ],
  exports: [
    RouterModule
  ]
})
export class AppRoutingModule { }
