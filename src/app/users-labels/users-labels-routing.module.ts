import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { UsersLabelsPage } from './users-labels.page';

const routes: Routes = [
  {
    path: '',
    component: UsersLabelsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class UsersLabelsPageRoutingModule {}
