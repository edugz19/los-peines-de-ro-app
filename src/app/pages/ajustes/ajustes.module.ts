import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AjustesPageRoutingModule } from './ajustes-routing.module';

import { AjustesPage } from './ajustes.page';
import { HeaderModule } from '../../modules/header/header.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AjustesPageRoutingModule,
    HeaderModule
  ],
  declarations: [AjustesPage]
})
export class AjustesPageModule {}
