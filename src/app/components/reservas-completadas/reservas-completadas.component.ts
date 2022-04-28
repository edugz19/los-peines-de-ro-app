import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Reserva } from 'src/app/models/reserva.interface';
import * as moment from 'moment';

@Component({
  selector: 'app-reservas-completadas',
  templateUrl: './reservas-completadas.component.html',
  styleUrls: ['./reservas-completadas.component.scss'],
})
export class ReservasCompletadasComponent implements OnInit {

  @Input() reservas: Reserva[];

  constructor(
    public modal: ModalController
  ) { }

  ngOnInit() {
    this.ordenarFechas();
  }

  ordenarFechas() {
    this.reservas.sort((a,b) => {
      const fecha1 = a.fecha + ' ' + a.horaInicio;
      const fecha2 = b.fecha + ' ' + b.horaInicio;

      const fech1 = moment(fecha1, 'YYYY-MM-DD HH:mm').format();
      const fech2 = moment(fecha2, 'YYYY-MM-DD HH:mm').format();

      return new Date(fech2).getTime() - new Date(fech1).getTime();
    });
  }

  formatearFecha(fecha: string, horaInicio: string) {
    moment.locale('es');

    const nuevaFecha = moment(
      fecha + horaInicio,
      'YYYY-MM-DD HH:mm'
    ).calendar();

    return nuevaFecha;
  }

  dismissModal() {
    this.modal.dismiss({
      dismissed: true
    });
  }

}
