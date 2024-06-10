import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ContactPhonePage } from './contact-phone.page';

const routes: Routes = [
  {
    path: '',
    component: ContactPhonePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ContactPhonePageRoutingModule {}
