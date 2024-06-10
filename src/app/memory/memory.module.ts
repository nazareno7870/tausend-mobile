import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MemoryPageRoutingModule } from './memory-routing.module';

import { MemoryPage } from './memory.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MemoryPageRoutingModule
  ],
  declarations: [MemoryPage],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class MemoryPageModule {}
