import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { filter, take } from 'rxjs/operators';
import { User } from 'firebase/auth';
import { Reserva } from 'src/app/models/reserva.interface';
import { ReservasService } from 'src/app/services/reservas/reservas.service';
import * as moment from 'moment';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AlertController, ModalController, ToastController } from '@ionic/angular';
import { ReservasCompletadasComponent } from '../reservas-completadas/reservas-completadas.component';
import { AngularFirestore } from '@angular/fire/compat/firestore';

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

  constructor(
    private resSvc: ReservasService,
    public router: Router,
    public modal: ModalController,
    public firestore: AngularFirestore,
    public alert: AlertController,
    public toast: ToastController
  ) {}

  ngOnInit() {
    this.subscriber = this.resSvc
      .getReservas()
      .pipe(take(1))
      .subscribe((reservas) => {
        for (const res of reservas) {
          if (res.uid === this.usuario.uid) {
            this.arrayReservas.push(res);
          }
        }

        this.ordenarResevas();

        if (this.tieneCitasCompletadas()) {
          this.reservasCompletadas = this.crearArrayCitasCompletadas(
            this.arrayReservas
          );
        }
      });
  }

  ordenarResevas() {
    this.arrayReservas.sort((a, b) => {
      const fecha1 = a.fecha + ' ' + a.horaInicio;
      const fecha2 = b.fecha + ' ' + b.horaInicio;

      const fech1 = moment(fecha1, 'YYYY-MM-DD HH:mm').format();
      const fech2 = moment(fecha2, 'YYYY-MM-DD HH:mm').format();

      return new Date(fech1).getTime() - new Date(fech2).getTime();
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

  mostrarBotonReserva(reserva: Reserva): boolean {
    let mostrarBoton = false;
    const fechaActual = moment().format();
    const fechaReserva = reserva.fecha + ' ' + reserva.horaInicio;
    const fechaFormateada = moment(fechaReserva, 'YYYY-MM-DD HH:mm').format();
    const fechaPagadoOnline = moment(fechaReserva, 'YYYY-MM-DD HH:mm')
      .subtract(3, 'hours')
      .format();

    if (!reserva.pagado && moment(fechaFormateada) >= moment(fechaActual)) {
      mostrarBoton = true;
    }

    if (reserva.pagado && moment(fechaPagadoOnline) > moment(fechaActual)) {
      mostrarBoton = true;
    }

    return mostrarBoton;
  }

  crearArrayCitasCompletadas(reservas: Reserva[]): Array<Reserva> {
    const fechaActual = moment().format();
    const arrayReservasCompletadas = [];

    for (const reserva of reservas) {
      const fecha = reserva.fecha + ' ' + reserva.horaFin;
      const fechaFormateada = moment(fecha, 'YYYY-MM-DD HH:mm').format();

      if (moment(fechaFormateada) < moment(fechaActual)) {
        arrayReservasCompletadas.push(reserva);
      }
    }

    return arrayReservasCompletadas;
  }

  async verReservasCompletadas(reservas: Reserva[]) {
    const modal = await this.modal.create({
      component: ReservasCompletadasComponent,
      cssClass: 'css-modal',
      componentProps: {
        reservas,
      },
    });

    return await modal.present();
  }

  cancelarReserva(reserva: Reserva) {
    this.presentAlertConfirm(reserva);
  }

  async presentAlertConfirm(reserva: Reserva) {
    const alert = await this.alert.create({
      cssClass: 'my-custom-class',
      header: 'Cancelar Reserva',
      message: `Va a cancelar una reserva para ${this.formatearFecha(
        reserva.fecha,
        reserva.horaInicio
      )}
                cuyo servicio es ${
                  reserva.nombre
                }. ¿Está seguro de que quiere continuar?`,
      buttons: [
        {
          text: 'Volver Atrás',
          role: 'cancel',
        },
        {
          text: 'Continuar',
          id: 'confirm-button',
          handler: () => {
            this.firestore
              .collection('reservas')
              .doc(reserva.id)
              .delete()
              .then(
                (response) => {
                  this.arrayReservas = [];

                  this.toastReserva('Reserva cancelada correctamente', 'success');

                  this.subscriber = this.resSvc
                    .getReservas()
                    .pipe(take(1))
                    .subscribe((reservas) => {
                      for (const res of reservas) {
                        if (res.uid === this.usuario.uid) {
                          this.arrayReservas.push(res);
                        }
                      }

                      this.ordenarResevas();
                    });
                },
                (err) => {
                  console.log(err);
                  this.toastReserva('error al cancelar la reserva', 'danger');
                }
              );
          },
        },
      ],
    });

    await alert.present();
  }

  async toastReserva(mensaje: string, color: string) {
    const toast = this.toast.create({
      message: mensaje,
      duration: 2000,
      color
    });

    (await toast).present();
  }
}
