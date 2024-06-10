import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { FailuresPage } from './failures.page';

const routes: Routes = [
  {
    path: '',
    component: FailuresPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FailuresPageRoutingModule {}
