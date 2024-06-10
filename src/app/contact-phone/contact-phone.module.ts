import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ContactPhonePageRoutingModule } from './contact-phone-routing.module';

import { ContactPhonePage } from './contact-phone.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ContactPhonePageRoutingModule
  ],
  declarations: [ContactPhonePage]
})
export class ContactPhonePageModule {}
