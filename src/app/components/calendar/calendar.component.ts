/* eslint-disable prefer-arrow/prefer-arrow-functions */
import { Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
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
import { Stripe } from '@ionic-native/stripe/ngx';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { FESTIVOS } from '../../constants/festivos.const';
import { LocalNotifications } from '@awesome-cordova-plugins/local-notifications/ngx';

declare let paypal;

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss'],
})
export class CalendarComponent implements OnInit, OnDestroy {
  @ViewChild(IonDatetime, { static: true }) datetime: IonDatetime;
  @ViewChild('paypal', { static: true }) paypalElement: ElementRef;
  @Input() servicio: Servicio;
  @Input() usuario: User;

  public modoOscuro: boolean;
  public horario: Array<string> = HORARIO;
  public festivos: Array<string> = FESTIVOS;
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
    public loadingController: LoadingController,
    private stripe: Stripe,
    private http: HttpClient,
    private localNotifications: LocalNotifications
  ) {
    // this.afFun.useEmulator('localhost', 5001);
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
    if (prefersDark.matches) {
      this.modoOscuro = true;
    } else {
      this.modoOscuro = false;
    }
  }

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



    if (dia === 'Saturday' || dia === 'Sunday' || this.festivos.includes(fechaFormateada)) {
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
            this.stripe.setPublishableKey(environment.stripeKey);

            const cardDetails = {
              // eslint-disable-next-line id-blacklist
              number: '4242424242424242',
              expMonth: 12,
              expYear: 2023,
              cvc: '220',
            };

            this.stripe
              .createCardToken(cardDetails)
              .then((token) => {
                console.log(token);
                this.makePayment(token.id, this.servicio);
              })
              .catch((error) => console.error(error));

            // this.modalController.dismiss({
            //   dismissed: true
            // });

            // this.checkout(this.servicio);

            // const id = servicio.id + usuario.uid + fecha + horaInicio;

            // this.reserva = {
            //   id,
            //   uid: usuario.uid,
            //   nombre: servicio.nombre,
            //   servicio: servicio.id,
            //   horaInicio,
            //   horaFin,
            //   fecha,
            //   precio: servicio.precio,
            //   pagado: true,
            // };

            // this.reservaSvc.createReserva(this.reserva, 'stripe');
          },
        },
        {
          text: 'Pagar con Paypal',
          icon: 'logo-paypal',
          handler: () => {

            const paypalCreateOrder = this.afFun.httpsCallable('paypalCreateOrder');
            const paypalHandleOrder = this.afFun.httpsCallable('paypalHandleOrder');

            paypal.Buttons({
              createOrder: (data, actions) => paypalCreateOrder(data).subscribe(res => res.data.id),
              onApprove: (data, actions) => paypalHandleOrder({orderId: data.orderID})
            }).render(this.paypalElement.nativeElement);
          }
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

            this.reservaSvc.createReserva(this.reserva, 'presencial');
            this.localNotifications.schedule({
              id: 1,
              text: `Se ha completado tu reserva de ${servicio.nombre} con fecha ${fecha} y hora ${horaInicio}`,
            });
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

  async presentLoading() {
    const loading = await this.loadingController.create({
      message: 'Realizando reserva...',
      duration: 2000,
    });
    await loading.present();
  }

  makePayment(token: string, servicio: Servicio) {
    this.http
      .post(
        'https://us-central1-los-peines-de-ro.cloudfunctions.net/payWithStripe',
        { token, servicio }
      )
      .subscribe((data) => {
        console.log(data);
      });
  }
}
