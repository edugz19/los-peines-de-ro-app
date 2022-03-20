import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-info-modal',
  templateUrl: './info-modal.page.html',
  styleUrls: ['./info-modal.page.scss'],
})
export class InfoModalPage {

  @Input() servicio: string;
  @Input() descripcion: string;
  @Input() precio: number;
  @Input() duracion: number;

  constructor(public modalController: ModalController) { }

  closeModal() {
    this.modalController.dismiss({
      dismissed: true
    });
  }

  truncarPrecio(precio: number): number {
    if (precio % 1 === 0) {
      return Math.trunc(precio);
    } else {
      return precio;
    }
  }

}
