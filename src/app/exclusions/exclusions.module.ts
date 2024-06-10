import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';

import { ExclusionsPage } from './exclusions.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild([
      {
        path: '',
        component: ExclusionsPage
      }
    ])
  ],
  declarations: [ExclusionsPage],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ExclusionsPageModule { }
