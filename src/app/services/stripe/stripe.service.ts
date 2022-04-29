import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Servicio } from 'src/app/models/servicio.interface';

@Injectable({
  providedIn: 'root'
})
export class StripeService {

  constructor(
    public http: HttpClient
  ) { }

  async stripePay(token: string, servicio: Servicio) {
    const options = new HttpHeaders();

    return await this.http
      .post(
        'https://europe-west2-los-peines-de-ro.cloudfunctions.net/stripePay',
        {
          token,
          servicio
        }, { headers: options }
      ).toPromise();
  }

}
