import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SmsPasswordChangePage } from './sms-password-change.page';

const routes: Routes = [
  {
    path: '',
    component: SmsPasswordChangePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SmsPasswordChangePageRoutingModule {}
