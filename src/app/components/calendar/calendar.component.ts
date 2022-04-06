import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { IonDatetime, ModalController } from '@ionic/angular';
import { Servicio } from 'src/app/models/servicio.interface';
import * as moment from 'moment';
import { HORARIO } from '../../constants/horario.const';

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss'],
})
export class CalendarComponent {

  @ViewChild(IonDatetime, { static: true }) datetime: IonDatetime;
  @Input() servicio: Servicio;

  public horario: Array<string> = HORARIO;
  public fechaActual: string;

  constructor(public modalController: ModalController) {
    this.fechaActual = moment().add(1,'d').format('YYYY-MM-DD');
    console.log(this.fechaActual);
  }

  truncarPrecio(precio: number): number {
    if (precio % 1 === 0) {
      return Math.trunc(precio);
    } else {
      return precio;
    }
  }

  volver() {
    this.modalController.dismiss({
      dismissed: true
    });
  }

  continuar() {
    console.log(this.datetime.confirm());
  }

}
