/* eslint-disable @typescript-eslint/consistent-type-assertions */
import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { StripeService } from 'src/app/services/stripe/stripe.service';
import { Servicio } from '../../models/servicio.interface';
import { AngularFireFunctions } from '@angular/fire/compat/functions';
import { VariablesGlobales } from '../../global/VariablesGlobales';
import {
  AngularFireStorage,
  AngularFireStorageReference,
  AngularFireUploadTask,
} from '@angular/fire/compat/storage';
import { Stripe } from '@ionic-native/stripe/ngx';
import { environment } from 'src/environments/environment';
import { AlertsService } from '../../services/alerts/alerts.service';
import { User } from 'firebase/auth';
import { LoadersService } from '../../services/loaders/loaders.service';
import { ReservasService } from '../../services/reservas/reservas.service';
import { Reserva } from 'src/app/models/reserva.interface';
import * as moment from 'moment';
import { LocalNotifications } from '@awesome-cordova-plugins/local-notifications/ngx';

const pdfMake = require('pdfmake/build/pdfmake');
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
(<any>pdfMake).vfs = pdfFonts.pdfMake.vfs;

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

  public ref: AngularFireStorageReference;
  public afTask: AngularFireUploadTask;
  public reserva: Reserva;
  public numeroCorrecto = false;
  public fechaCorrecta = false;
  public cvcCorrecto = false;
  public inputSinErrores = true;
  public pdf: any;

  constructor(
    public stripeSvc: StripeService,
    public modalCtrl: ModalController,
    private stripe: Stripe,
    private afFun: AngularFireFunctions,
    private alerts: AlertsService,
    private loader: LoadersService,
    private reservaSvc: ReservasService,
    private modalController: ModalController,
    private localNotifications: LocalNotifications,
    public variables: VariablesGlobales,
    public storage: AngularFireStorage
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
                this.generarFactura(cardDetails.number);
                this.localNotifications.schedule({
                  id: 1,
                  // eslint-disable-next-line max-len
                  text: `Se ha completado tu reserva: ${this.servicio.nombre.toUpperCase()} con fecha de ${this.formatearFecha(
                    this.fecha,
                    this.horaInicio
                  )}.`,
                });
                this.cerrarModal();

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

  generarFactura(numero: string) {
    const doc = {
      content: [
        // Header
        {
          columns: [
            {
              image: this.variables.imagenBlob,
              width: 150,
            },

            [
              {
                text: 'FACTURA',
                style: 'invoiceTitle',
                width: '*',
              },
              {
                stack: [
                  {
                    columns: [
                      {
                        text: 'Factura Nº',
                        style: 'invoiceSubTitle',
                        width: '*',
                      },
                      {
                        text: this.reserva.id.substring(0, 10),
                        style: 'invoiceSubValue',
                        width: 100,
                      },
                    ],
                  },
                  {
                    columns: [
                      {
                        text: 'Fecha de compra',
                        style: 'invoiceSubTitle',
                        width: '*',
                      },
                      {
                        text: moment().format('DD-MM-YYYY HH:mm'),
                        style: 'invoiceSubValue',
                        width: 100,
                      },
                    ],
                  },
                ],
              },
            ],
          ],
        },
        // Billing Headers
        {
          columns: [
            {
              text: 'Datos de la empresa',
              style: 'invoiceBillingTitle1',
            },
            {
              text: 'Datos del cliente',
              style: 'invoiceBillingTitle2',
            },
          ],
        },
        // Billing Details
        {
          columns: [
            {
              text: 'Los Peines de Ro',
              style: 'invoiceBillingDetails1',
            },
            {
              text: this.usuario.displayName,
              style: 'invoiceBillingDetails2',
            },
          ],
        },
        // Billing Address Title
        // Billing Address
        {
          columns: [
            {
              text: 'Calle Corte Mohicano, 4, Bajo \n Jaén 23001 \n   España',
              style: 'invoiceBillingAddress1',
            },
            {
              // eslint-disable-next-line max-len
              text: `${
                this.usuario.email
              } \n Número de tarjeta: \n ${numero.substring(
                0,
                4
              )} ${numero.substring(4, 8)} ${numero.substring(
                8,
                12
              )} ${numero.substring(12, 16)}`,
              style: 'invoiceBillingAddress2',
            },
          ],
        },
        // Line breaks
        '\n\n',
        // Items
        {
          table: {
            // headers are automatically repeated if the table spans over multiple pages
            // you can declare how many rows should be treated as headers
            headerRows: 1,
            widths: ['*', 'auto', 80],

            body: [
              // Table Header
              [
                {
                  text: 'Servicio',
                  style: ['itemsHeader', 'center'],
                },
                {
                  text: 'Fecha',
                  style: ['itemsHeader', 'center'],
                },
                {
                  text: 'Precio',
                  style: ['itemsHeader', 'center'],
                },
              ],
              // Items
              // Item 1
              [
                {
                  text: this.servicio.nombre.toUpperCase(),
                  style: 'itemNumber',
                },
                {
                  text: this.reserva.fecha,
                  style: 'itemNumber',
                },
                {
                  text: (this.reserva.precio * 0.79).toFixed(2) + '€',
                  style: 'itemTotal',
                },
              ],
              // END Items
            ],
          }, // table
          //  layout: 'lightHorizontalLines'
        },
        // TOTAL
        {
          table: {
            // headers are automatically repeated if the table spans over multiple pages
            // you can declare how many rows should be treated as headers
            headerRows: 0,
            widths: ['*', 80],

            body: [
              // Total
              [
                {
                  text: 'Subtotal',
                  style: 'itemsFooterSubTitle',
                },
                {
                  text: (this.reserva.precio * 0.79).toFixed(2) + '€',
                  style: 'itemsFooterSubValue',
                },
              ],
              [
                {
                  text: 'IVA 21%',
                  style: 'itemsFooterSubTitle',
                },
                {
                  text: (this.reserva.precio * 0.21).toFixed(2) + '€',
                  style: 'itemsFooterSubValue',
                },
              ],
              [
                {
                  text: 'TOTAL',
                  style: 'itemsFooterTotalTitle',
                },
                {
                  text: this.reserva.precio.toFixed(2) + '€',
                  style: 'itemsFooterTotalValue',
                },
              ],
            ],
          }, // table
          layout: 'lightHorizontalLines',
        },
        {
          text: 'Terminos y condiciones',
          style: 'sectionHeader',
        },
        {
          ul: [
            // eslint-disable-next-line max-len
            'Los servicios contratados de manera online tendrán un plazo máximo de cancelación de 3 horas antes de la hora de comienzo.',
            'Esto es una factura generada automáticamente.',
          ],
        },
      ],
      styles: {
        invoiceTitle: {
          fontSize: 22,
          bold: true,
          alignment: 'right',
          margin: [0, 0, 0, 15],
        },
        // Invoice Details
        invoiceSubTitle: {
          fontSize: 12,
          alignment: 'right',
        },
        invoiceSubValue: {
          fontSize: 12,
          alignment: 'right',
        },
        // Billing Headers
        invoiceBillingTitle1: {
          fontSize: 14,
          bold: true,
          alignment: 'left',
          margin: [0, 20, 0, 5],
        },
        invoiceBillingTitle2: {
          fontSize: 14,
          bold: true,
          alignment: 'right',
          margin: [0, 20, 0, 5],
        },
        // Billing Details
        invoiceBillingDetails1: {
          alignment: 'left',
        },
        invoiceBillingDetails2: {
          alignment: 'right',
        },
        invoiceBillingAddressTitle1: {
          margin: [0, 7, 0, 3],
          bold: true,
        },
        invoiceBillingAddressTitle2: {
          margin: [0, 7, 0, 3],
          bold: true,
        },
        invoiceBillingAddress1: {},
        invoiceBillingAddress2: {
          alignment: 'right',
        },
        // Items Header
        itemsHeader: {
          margin: [0, 5, 0, 5],
          bold: true,
        },
        // Item Title
        itemTitle: {
          bold: true,
        },
        itemSubTitle: {
          italics: true,
          fontSize: 11,
        },
        itemNumber: {
          margin: [0, 5, 0, 5],
          alignment: 'center',
        },
        itemTotal: {
          margin: [0, 5, 0, 5],
          bold: true,
          alignment: 'center',
        },

        // Items Footer (Subtotal, Total, Tax, etc)
        itemsFooterSubTitle: {
          margin: [0, 5, 0, 5],
          bold: true,
          alignment: 'right',
        },
        itemsFooterSubValue: {
          margin: [0, 5, 0, 5],
          bold: true,
          alignment: 'center',
        },
        itemsFooterTotalTitle: {
          margin: [0, 5, 0, 5],
          bold: true,
          alignment: 'right',
        },
        itemsFooterTotalValue: {
          margin: [0, 5, 0, 5],
          bold: true,
          alignment: 'center',
        },
        signaturePlaceholder: {
          margin: [0, 70, 0, 0],
        },
        signatureName: {
          bold: true,
          alignment: 'center',
        },
        signatureJobTitle: {
          italics: true,
          fontSize: 10,
          alignment: 'center',
        },
        notesTitle: {
          fontSize: 10,
          bold: true,
          margin: [0, 50, 0, 3],
        },
        notesText: {
          fontSize: 10,
        },
        center: {
          alignment: 'center',
        },
        sectionHeader: {
          margin: [0, 40, 0, 0],
        },
      },
      defaultStyle: {
        columnGap: 20,
      },
    };

    this.pdf = pdfMake.createPdf(doc);
    console.log(this.pdf);
    this.pdf.getBlob((blob) => {
      console.log(blob);
      const filePath = `facturas/${this.usuario.uid}/${this.reserva.id}.pdf`;
      this.ref = this.storage.ref(filePath);
      this.afTask = this.ref.put(blob);
    });

    this.pdf.getBase64((data) => {
      const response = this.stripeSvc.nodemailer(
        this.usuario,
        this.reserva,
        data
      );
      const res = response as Promise<any>;
      res.then((resp) => {
        console.log(resp);
        if (resp.status === 'succeeded') {
          console.log('Email enviado');
        }
      });
    });
  }
}
