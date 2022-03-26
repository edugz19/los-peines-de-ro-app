import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { RecuperarPassPageRoutingModule } from './recuperar-pass-routing.module';

import { RecuperarPassPage } from './recuperar-pass.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RecuperarPassPageRoutingModule,
    ReactiveFormsModule
  ],
  declarations: [RecuperarPassPage]
})
export class RecuperarPassPageModule {}
