import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { take } from 'rxjs/operators';
import { User } from 'firebase/auth';
import { Reserva } from 'src/app/models/reserva.interface';
import { ReservasService } from 'src/app/services/reservas/reservas.service';
import * as moment from 'moment';

@Component({
  selector: 'app-reservas',
  templateUrl: './reservas.component.html',
  styleUrls: ['./reservas.component.scss'],
})
export class ReservasComponent implements OnInit, OnDestroy {

  @Input() usuario: User;

  public arrayReservas: Array<Reserva> = [];

  constructor(private resSvc: ReservasService) {}

  ngOnInit() {
    this.resSvc
      .getReservas()
      .pipe(take(1))
      .subscribe((reservas) => {
        for (const res of reservas) {
          if (res.uid === this.usuario.uid) {
            this.arrayReservas.push(res);
            // console.log(this.arrayReservas);
          }
        }
      });
  }

  ngOnDestroy(): void {
    console.log('Reservas destruido');
  }

  formatearFecha(fecha: string, horaInicio: string) {
    moment.locale('es');

    const nuevaFecha = moment(fecha + horaInicio, 'YYYY-MM-DD HH:mm').calendar();
    return nuevaFecha;
  }
}
