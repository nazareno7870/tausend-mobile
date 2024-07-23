import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TcpPage } from './tcp.page';

const routes: Routes = [
  {
    path: '',
    component: TcpPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TcpPageRoutingModule {}
