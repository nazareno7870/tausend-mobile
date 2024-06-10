import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { UsersLabelsPageRoutingModule } from './users-labels-routing.module';

import { UsersLabelsPage } from './users-labels.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    UsersLabelsPageRoutingModule
  ],
  declarations: [UsersLabelsPage]
})
export class UsersLabelsPageModule {}
