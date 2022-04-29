/* eslint-disable @typescript-eslint/consistent-type-assertions */
import {
  Component,
  ElementRef,
  Input,
  NgZone,
  OnInit,
  ViewChild,
} from '@angular/core';
import { ModalController } from '@ionic/angular';
import { StripeService } from 'src/app/services/stripe/stripe.service';
import { Servicio } from '../../models/servicio.interface';
import { AngularFireFunctions } from '@angular/fire/compat/functions';
import { Stripe } from '@ionic-native/stripe/ngx';
import { environment } from 'src/environments/environment';
import { AlertsService } from '../../services/alerts/alerts.service';
import { User } from 'firebase/auth';
import { LoadersService } from '../../services/loaders/loaders.service';
import { ReservasService } from '../../services/reservas/reservas.service';
import { Reserva } from 'src/app/models/reserva.interface';
import * as moment from 'moment';
import { LocalNotifications } from '@awesome-cordova-plugins/local-notifications/ngx';

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss'],
})
export class CardComponent implements OnInit {
  @Input() servicio: Servicio;
  @Input() usuario: User;
  @Input() fecha: string;
  @Input() horaInicio: string;
  @Input() horaFin: string;

  @ViewChild('number1') number1: ElementRef<HTMLInputElement>;
  @ViewChild('number2') number2: ElementRef<HTMLInputElement>;
  @ViewChild('number3') number3: ElementRef<HTMLInputElement>;
  @ViewChild('number4') number4: ElementRef<HTMLInputElement>;
  @ViewChild('mes') mes: ElementRef<HTMLSelectElement>;
  @ViewChild('año') año: ElementRef<HTMLSelectElement>;
  @ViewChild('cvc') cvc: ElementRef<HTMLInputElement>;

  public reserva: Reserva;
  public numeroCorrecto = false;
  public fechaCorrecta = false;
  public cvcCorrecto = false;
  public inputSinErrores = true;

  constructor(
    public stripeSvc: StripeService,
    public modalCtrl: ModalController,
    private stripe: Stripe,
    private afFun: AngularFireFunctions,
    private alerts: AlertsService,
    private loader: LoadersService,
    private reservaSvc: ReservasService,
    private modalController: ModalController,
    private localNotifications: LocalNotifications
  ) {
    this.stripe.setPublishableKey(environment.stripeKey);
  }

  ngOnInit(): void {
    console.log(this.usuario);
  }

  pagar() {
    const array = [
      this.number1.nativeElement.value,
      this.number2.nativeElement.value,
      this.number3.nativeElement.value,
      this.number4.nativeElement.value,
      this.mes.nativeElement.options[this.mes.nativeElement.selectedIndex]
        .value,
      this.año.nativeElement.options[this.año.nativeElement.selectedIndex]
        .value,
      this.cvc.nativeElement.value
    ];

    console.log(array);

    for (const item of array) {
      if (item === '' || item === null || item === undefined) {
        console.log('Error en los datos');
        this.inputSinErrores = false;
      }
    }

    if (this.inputSinErrores) {
      const cardDetails = {
        // eslint-disable-next-line id-blacklist
        number:
          this.number1.nativeElement.value +
          this.number2.nativeElement.value +
          this.number3.nativeElement.value +
          this.number4.nativeElement.value,
        expMonth: Number(
          this.mes.nativeElement.options[this.mes.nativeElement.selectedIndex]
            .value
        ),
        expYear: Number(
          this.año.nativeElement.options[this.año.nativeElement.selectedIndex]
            .value
        ),
        cvc: this.cvc.nativeElement.value,
        name: this.usuario.displayName,
        email: this.usuario.email,
      };

      this.stripe
        .validateCardNumber(cardDetails.number)
        .then((success) => {
          console.log('Numero de la tarjeta válido');
          this.numeroCorrecto = true;
        })
        .catch((error) => {
          console.log('Numero de la tarjeta inválido');
        });

      this.stripe
        .validateExpiryDate(
          cardDetails.expMonth.toString(),
          cardDetails.expYear.toString()
        )
        .then((success) => {
          console.log('Fecha de la tarjeta válida');
          this.fechaCorrecta = true;
        })
        .catch((error) => {
          console.log('Fecha de la tarjeta inválida');
        });

      this.stripe
        .validateCVC(cardDetails.cvc)
        .then((success) => {
          console.log('CVC de la tarjeta válido');
          this.cvcCorrecto = true;
        })
        .catch((error) => {
          console.log('CVC de la tarjeta inválido');
        });

      if (this.numeroCorrecto && this.fechaCorrecta && this.cvcCorrecto) {
        this.loader.presentLoading('Realizando el pago....', 7000);
        this.stripe
          .createCardToken(cardDetails)
          .then((token) => {
            console.log(token);
            const response = this.stripeSvc.stripePay(token.id, this.servicio);
            const resStripe = response as Promise<any>;

            resStripe.then((res) => {
              console.log(res);
              if (res.status === 'succeeded') {
                console.log('Pago correcto');

                const id =
                  this.servicio.id +
                  this.usuario.uid +
                  this.fecha +
                  this.horaInicio;

                this.reserva = {
                  id,
                  uid: this.usuario.uid,
                  nombre: this.servicio.nombre,
                  servicio: this.servicio.id,
                  horaInicio: this.horaInicio,
                  horaFin: this.horaFin,
                  fecha: this.fecha,
                  precio: this.servicio.precio,
                  pagado: true,
                };

                this.reservaSvc.createReserva(this.reserva);
                  this.cerrarModal();
                  this.localNotifications.schedule({
                    id: 1,
                    // eslint-disable-next-line max-len
                    text: `Se ha completado tu reserva: ${this.servicio.nombre.toUpperCase()} con fecha de ${this.formatearFecha(
                      this.fecha,
                      this.horaInicio
                    )}.`,
                  });

              } else {
                console.log('Error al realizar el pago');
                this.alerts.mostrarMensaje(
                  'No se ha podido realizar el pago',
                  'danger'
                );
              }
            });
          })
          .catch((error) => console.error(error));
      } else {
        this.alerts.mostrarMensaje(
          'Los datos de la tarjeta son incorrectos',
          'danger'
        );
      }
    } else {
      this.alerts.mostrarMensaje(
        'Los datos de la tarjeta son incorrectos',
        'danger'
      );
    }
  }

  formatearFecha(dia: string, hora: string): string {
    const fecha = dia + ' ' + hora;
    return moment(fecha, 'YYYY-MM-DD HH:mm').locale('es').format('LLLL');
  }

  cerrarModal() {
    this.modalController.dismiss({
      dismissed: true,
    });
  }
}
