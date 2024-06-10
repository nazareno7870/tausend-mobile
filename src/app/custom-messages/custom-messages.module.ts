import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CustomMessagesPageRoutingModule } from './custom-messages-routing.module';

import { CustomMessagesPage } from './custom-messages.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CustomMessagesPageRoutingModule
  ],
  declarations: [CustomMessagesPage]
})
export class CustomMessagesPageModule {}
