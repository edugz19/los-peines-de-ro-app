import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { filter, take } from 'rxjs/operators';
import { User } from 'firebase/auth';
import { Reserva } from 'src/app/models/reserva.interface';
import { ReservasService } from 'src/app/services/reservas/reservas.service';
import * as moment from 'moment';
import { NavigationEnd, Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-reservas',
  templateUrl: './reservas.component.html',
  styleUrls: ['./reservas.component.scss'],
})
export class ReservasComponent implements OnInit, OnDestroy {
  @Input() usuario: User;

  public arrayReservas: Array<Reserva> = [];
  public reservasCompletadas: Array<Reserva> = [];
  public subscriber: Subscription;

  constructor(private resSvc: ReservasService, public router: Router) {}

  ngOnInit() {
    this.subscriber = this.resSvc.getReservas()
    .pipe(take(1))
    .subscribe((reservas) => {
      for (const res of reservas) {
        if (res.uid === this.usuario.uid) {
          this.arrayReservas.push(res);
        }
      }

      this.arrayReservas.sort((a,b) => {
        const fecha1 = a.fecha + ' ' + a.horaInicio;
        const fecha2 = b.fecha + ' ' + b.horaInicio;

        const fech1 = moment(fecha1, 'YYYY-MM-DD HH:mm').format();
        const fech2 = moment(fecha2, 'YYYY-MM-DD HH:mm').format();

        return new Date(fech1).getTime() - new Date(fech2).getTime();
      });
    });
  }

  ngOnDestroy(): void {
    console.log('Reservas destruido');
    this.subscriber.unsubscribe();
  }

  formatearFecha(fecha: string, horaInicio: string) {
    moment.locale('es');

    const nuevaFecha = moment(
      fecha + horaInicio,
      'YYYY-MM-DD HH:mm'
    ).calendar();

    return nuevaFecha;
  }

  esCitaPendiente(reserva: Reserva): boolean {
    const fechaActual = moment().format();
    const fechaReserva = reserva.fecha + ' ' + reserva.horaFin;
    if (moment(fechaActual) <= moment(fechaReserva, 'YYYY-MM-DD HH:mm')) {
      return true;
    } else {
      return false;
    }
  }

  tieneCitasCompletadas(): boolean {
    let isCompleted = false;
    const fechaActual = moment().format();

    for (const reserva of this.arrayReservas) {
      const fecha = reserva.fecha + ' ' + reserva.horaFin;
      const fechaFormateada = moment(fecha, 'YYYY-MM-DD HH:mm').format();

      if (moment(fechaFormateada) < moment(fechaActual)) {
        isCompleted = true;
      }
    }

    return isCompleted;
  }

  verCitas(reservas) {
    console.log(reservas);
  }

  mostrarBotonReserva(reserva: Reserva): boolean {
    let mostrarBoton = false;
    const fechaActual = moment().format();
    const fechaReserva = reserva.fecha + ' ' + reserva.horaInicio;
    const fechaFormateada = moment(fechaReserva, 'YYYY-MM-DD HH:mm').format();
    const fechaPagadoOnline = moment(fechaReserva, 'YYYY-MM-DD HH:mm').subtract(3, 'hours').format();

    if (!reserva.pagado && moment(fechaFormateada) >= moment(fechaActual)) {
      mostrarBoton = true;
    }

    if (reserva.pagado && moment(fechaPagadoOnline) > moment(fechaActual)) {
      mostrarBoton = true;
    }

    return mostrarBoton;
  }
}
