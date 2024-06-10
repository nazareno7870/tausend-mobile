import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { InstalatorPageRoutingModule } from './instalator-routing.module';

import { InstalatorPage } from './instalator.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    InstalatorPageRoutingModule
  ],
  declarations: [InstalatorPage]
})
export class InstalatorPageModule {}
