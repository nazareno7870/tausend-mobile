import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SmsPasswordChangePageRoutingModule } from './sms-password-change-routing.module';

import { SmsPasswordChangePage } from './sms-password-change.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SmsPasswordChangePageRoutingModule
  ],
  declarations: [SmsPasswordChangePage]
})
export class SmsPasswordChangePageModule {}
