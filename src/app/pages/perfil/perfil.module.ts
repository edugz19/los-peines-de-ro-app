import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PerfilPageRoutingModule } from './perfil-routing.module';

import { PerfilPage } from './perfil.page';
import { HeaderComponent } from 'src/app/components/header/header.component';
import { HeaderModule } from '../../modules/header/header.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PerfilPageRoutingModule,
    HeaderModule,
    ReactiveFormsModule
  ],
  declarations: [PerfilPage]
})
export class PerfilPageModule {}
