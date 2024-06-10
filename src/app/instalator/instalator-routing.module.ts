import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { InstalatorPage } from './instalator.page';

const routes: Routes = [
  {
    path: '',
    component: InstalatorPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class InstalatorPageRoutingModule {}
