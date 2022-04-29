import { Injectable } from '@angular/core';
import { LoadingController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class LoadersService {

  constructor(
    public loader: LoadingController
  ) { }

  async presentLoading(mensaje: string, tiempo: number) {
    const loading = await this.loader.create({
      message: mensaje,
      duration: tiempo
    });
    await loading.present();
  }
}
