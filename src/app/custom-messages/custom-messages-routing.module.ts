import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CustomMessagesPage } from './custom-messages.page';

const routes: Routes = [
  {
    path: '',
    component: CustomMessagesPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CustomMessagesPageRoutingModule {}
