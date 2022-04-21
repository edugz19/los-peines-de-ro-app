import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PerfilPageRoutingModule } from './perfil-routing.module';

import { PerfilPage } from './perfil.page';
import { HeaderModule } from '../../modules/header/header.module';
import { ReservasComponent } from '../../components/reservas/reservas.component';
import { FavoritosComponent } from '../../components/favoritos/favoritos.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PerfilPageRoutingModule,
    HeaderModule,
    ReactiveFormsModule
  ],
  declarations: [PerfilPage, ReservasComponent, FavoritosComponent]
})
export class PerfilPageModule {}
