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
}
