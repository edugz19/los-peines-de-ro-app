import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ServiciosPageRoutingModule } from './servicios-routing.module';

import { ServiciosPage } from './servicios.page';
import { FilterPipe } from 'src/app/pipes/filter.pipe';
import { SelectPipe } from '../../pipes/select.pipe';
import { CalendarComponent } from '../../components/calendar/calendar.component';
import { InfoComponent } from '../../components/info/info.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ServiciosPageRoutingModule
  ],
  declarations: [
    ServiciosPage,
    FilterPipe,
    SelectPipe,
    CalendarComponent,
    InfoComponent
  ]
})
export class ServiciosPageModule {}
