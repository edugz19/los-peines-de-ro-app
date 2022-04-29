import { Injectable } from '@angular/core';
import { ToastController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class AlertsService {

  constructor(
    public toast: ToastController
  ) {}

  async mostrarMensaje(mensaje: string, color: string) {
    const toast = this.toast.create({
      message: mensaje,
      duration: 2000,
      color,
    });

    (await toast).present();
  }
}
