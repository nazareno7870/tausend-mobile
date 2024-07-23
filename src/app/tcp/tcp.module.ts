import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TcpPageRoutingModule } from './tcp-routing.module';

import { TcpPage } from './tcp.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TcpPageRoutingModule
  ],
  declarations: [TcpPage]
})
export class TcpPageModule {}
