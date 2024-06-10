import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { InsideAssembleModalPageRoutingModule } from './inside-assemble-modal-routing.module';

import { InsideAssembleModalPage } from './inside-assemble-modal.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    InsideAssembleModalPageRoutingModule
  ],
  declarations: [InsideAssembleModalPage]
})
export class InsideAssembleModalPageModule {}
