/* eslint-disable quote-props */
/* eslint-disable @typescript-eslint/naming-convention */
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Reserva } from 'src/app/models/reserva.interface';
import { environment } from 'src/environments/environment';
import * as moment from 'moment';

@Injectable({
  providedIn: 'root'
})
export class MessagingService {

  constructor(
    private http: HttpClient
  ) { }

  postMessageData(reserva: Reserva) {
    const url = 'https://fcm.googleapis.com/fcm/send';
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': 'key=' + environment.serverKey
    });

    moment.locale('es');
    const fecha = moment(reserva.fecha + ' ' + reserva.horaInicio, 'YYYY-MM-DD HH:mm').calendar();

    const body = {
      // eslint-disable-next-line max-len
      to: 'dSIS_gDU5RJYAlOZMMPD-o:APA91bHbEsCM6KjxvT5ZO-hhYcPNztQp7D2Y6DKCNgrSAbTh3W2I53EGpJBFKRJlDayaR9ZB1gcZugaVVqyFrQksOkWLZHhk3o4USNmaVG3wPFNYo34MB-ChPiHh-W2cuNjVciPHSzNH',
      notification: {
        title: 'Se ha creado una nueva reserva',
        body: `Reserva para ${reserva.nombre.toUpperCase()} para el día ${fecha}.`,
        // eslint-disable-next-line max-len
        icon: 'https://firebasestorage.googleapis.com/v0/b/los-peines-de-ro.appspot.com/o/icon.png?alt=media&token=369dd884-3e61-4e3c-ae88-a3a0be54ac17',
      }
    };

    return this.http.post(url, body, { headers })
      .subscribe(
        data => console.log('success: ', data),
        error => console.log('error; ', error)
      );
  }
}
