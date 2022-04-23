/* eslint-disable prefer-arrow/prefer-arrow-functions */
import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import {
  IonDatetime,
  ModalController,
  ActionSheetController,
  ToastController,
} from '@ionic/angular';
import { Servicio } from 'src/app/models/servicio.interface';
import * as moment from 'moment';
import { HORARIO } from '../../constants/horario.const';
import { Reserva } from 'src/app/models/reserva.interface';
import { ReservasService } from '../../services/reservas/reservas.service';
import { User } from 'firebase/auth';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { AngularFireFunctions } from '@angular/fire/compat/functions';
import { LoadingController } from '@ionic/angular';

// eslint-disable-next-line @typescript-eslint/naming-convention
declare let Stripe: any;

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss'],
})
export class CalendarComponent implements OnInit, OnDestroy {
  @ViewChild(IonDatetime, { static: true }) datetime: IonDatetime;
  @Input() servicio: Servicio;
  @Input() usuario: User;

  public horario: Array<string> = HORARIO;
  public horarioInvalido: Array<string> = [];
  public horarioReal: Array<string | any> = [];
  public fechaActual: string;
  public fecha: string;
  public hora = '';
  public horaFin: string;
  public esDiaValido = false;
  public reservas: Reserva[] = [];
  public select: any;
  public horaInvalida = true;
  private reserva: Reserva;
  // eslint-disable-next-line @typescript-eslint/member-ordering
  public ev: any;

  constructor(
    public modalController: ModalController,
    private reservaSvc: ReservasService,
    public actionSheetController: ActionSheetController,
    public toastController: ToastController,
    public router: Router,
    private afFun: AngularFireFunctions,
    public loadingController: LoadingController
  ) {}

  ngOnInit(): void {
    this.fechaActual = moment().add(1, 'd').format('YYYY-MM-DD');
    this.reservaSvc.getReservas().subscribe((reservas) => {
      this.reservas = reservas;
    });
  }

  ngOnDestroy(): void {
    console.log('Destruido');
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
      dismissed: true,
    });
  }

  continuar(servicio: Servicio, usuario: User) {
    console.log(this.hora, this.fecha, this.horaFin);
    console.log(servicio);
    this.openActionSheet(
      servicio,
      usuario,
      this.hora,
      this.horaFin,
      this.fecha
    );
  }

  cambiarHora(ev: any, duracion: number) {
    this.hora = ev.target.value;
    this.horaFin = moment(this.hora, 'HH:mm')
      .add(duracion, 'm')
      .format('HH:mm');
    this.horaInvalida = false;
  }

  comprobarFecha(ev: any, duracion: number) {
    const fecha = moment(ev.detail.value);
    const fechaFormateada = fecha.format('YYYY-MM-DD');
    this.fecha = fechaFormateada;
    const dia = moment.weekdays(fecha.day());
    this.select = null;
    this.horarioReal = [];
    const array = [];
    this.horaInvalida = true;
    this.hora = '';

    if (dia === 'Saturday' || dia === 'Sunday') {
      this.esDiaValido = false;
    } else {
      for (const item of this.reservas) {
        if (item.fecha === fechaFormateada) {
          const x = this.horario.indexOf(item.horaInicio);
          const y = this.horario.indexOf(item.horaFin);

          for (let i = 0; i < this.horario.length; i++) {
            const horaFin = moment(this.horario[i], 'HH:mm')
              .add(duracion, 'm')
              .format('HH:mm');
            const horaValida = this.comprobarHoraValidaDiaConCitas(
              this.horario[i],
              horaFin,
              item.horaInicio,
              item.horaFin
            );

            // console.log(this.horario[i], horaFin, horaValida);

            if ((i > x && i < y) || !horaValida) {
              array.push(this.horario[i]);
            }
          }
        } else {
          // eslint-disable-next-line @typescript-eslint/prefer-for-of
          for (let i = 0; i < this.horario.length; i++) {
            const horaFin = moment(this.horario[i], 'HH:mm')
              .add(duracion, 'm')
              .format('HH:mm');
            const horaValida = this.comprobarHoraValidaDiaSinCitas(
              this.horario[i],
              horaFin
            );

            // console.log(this.horario[i], horaFin, horaValida);

            if (!horaValida) {
              array.push(this.horario[i]);
            }
          }
        }
      }

      const dataArr = new Set(array);
      this.horarioInvalido = [...dataArr];
      // console.log(this.horarioInvalido);

      const newArray = this.horario.concat(this.horarioInvalido);

      // console.log(newArray);

      const uniqueValues = (ar) => [
        ...new Set(
          ar.filter((el) => ar.filter((el2) => el2 === el).length === 1)
        ),
      ];

      this.horarioReal = uniqueValues(newArray);

      // console.log(this.horarioReal);

      if (this.horarioReal.length > 0) {
        this.esDiaValido = true;
      }
    }
  }

  comprobarHoraValidaDiaConCitas(
    horaInicio: string,
    horaFin: string,
    horaInicioCitaExistente: string,
    horaFinCitaExistente: string
  ): boolean {
    if (
      (moment(horaInicio, 'HH:mm') >= moment('09:00', 'HH:mm') &&
        moment(horaFin, 'HH:mm') <= moment('14:00', 'HH:mm')) ||
      (moment(horaInicio, 'HH:mm') >= moment('16:00', 'HH:mm') &&
        moment(horaFin, 'HH:mm') <= moment('20:00', 'HH:mm'))
    ) {
      if (
        moment(horaFin, 'HH:mm') <= moment(horaInicioCitaExistente, 'HH:mm') ||
        moment(horaInicio, 'HH:mm') >= moment(horaFinCitaExistente, 'HH:mm')
      ) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  comprobarHoraValidaDiaSinCitas(horaInicio: string, horaFin: string): boolean {
    if (
      (moment(horaInicio, 'HH:mm') >= moment('09:00', 'HH:mm') &&
        moment(horaFin, 'HH:mm') <= moment('14:00', 'HH:mm')) ||
      (moment(horaInicio, 'HH:mm') >= moment('16:00', 'HH:mm') &&
        moment(horaFin, 'HH:mm') <= moment('20:00', 'HH:mm'))
    ) {
      return true;
    } else {
      return false;
    }
  }

  async openActionSheet(
    servicio: Servicio,
    usuario: User,
    horaInicio: string,
    horaFin: string,
    fecha: string
  ) {
    const fechaFormat = moment(fecha, 'YYYY-MM-DD').format('DD-MM-YYYY');

    const actionSheet = this.actionSheetController.create({
      header:
        servicio.nombre.toUpperCase() +
        ' - ' +
        this.truncarPrecio(servicio.precio) +
        '€',
      subHeader:
        'Reserva el día ' +
        fechaFormat +
        ', con inicio a las ' +
        horaInicio +
        ' y finalización a las ' +
        horaFin +
        '.',
      cssClass: 'my-css-class',
      buttons: [
        {
          text: 'Pagar con tarjeta de crédito/débito',
          icon: 'card-outline',
          handler: () => {
            this.checkout(this.servicio);

            const id = servicio.id + usuario.uid + fecha + horaInicio;

            this.reserva = {
              id,
              uid: usuario.uid,
              nombre: servicio.nombre,
              servicio: servicio.id,
              horaInicio,
              horaFin,
              fecha,
              precio: servicio.precio,
              pagado: true,
            };

            this.reservaSvc.createReserva(this.reserva);
          },
        },
        {
          text: 'Pagar con Paypal',
          icon: 'logo-paypal',
        },
        {
          text: 'Pago presencial',
          icon: 'cash-outline',
          handler: () => {
            const id = servicio.id + usuario.uid + fecha + horaInicio;

            this.reserva = {
              id,
              uid: usuario.uid,
              nombre: servicio.nombre,
              servicio: servicio.id,
              horaInicio,
              horaFin,
              fecha,
              precio: servicio.precio,
              pagado: false,
            };

            this.reservaSvc.createReserva(this.reserva);
            this.presentLoading();
            this.modalController.dismiss({
              dismissed: true,
            });
          },
        },
        {
          text: 'Volver atrás',
          role: 'cancel',
          icon: 'close',
        },
      ],
    });

    (await actionSheet).present();
  }

  checkout(servicio: Servicio): void {
    const stripe = Stripe(environment.stripeKey);

    this.afFun
      .httpsCallable('stripeCheckoutWithoutQueries')({
        titulo: servicio.nombre,
        precio: servicio.precio,
      })
      .subscribe((result) => {
        console.log({ result });

        this.ev = stripe
          .redirectToCheckout({
            sessionId: result,
          })
          .then(function(results: any) {
            console.log(results);
          });
      });
  }

  async presentLoading() {
    const loading = await this.loadingController.create({
      message: 'Realizando reserva...',
      duration: 2000,
    });
    await loading.present();
  }
}
