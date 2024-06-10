import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { InsideAssembleModalPage } from './inside-assemble-modal.page';

const routes: Routes = [
  {
    path: '',
    component: InsideAssembleModalPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class InsideAssembleModalPageRoutingModule {}
