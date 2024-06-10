import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { FailuresPageRoutingModule } from './failures-routing.module';

import { FailuresPage } from './failures.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    FailuresPageRoutingModule
  ],
  declarations: [FailuresPage]
})
export class FailuresPageModule {}
