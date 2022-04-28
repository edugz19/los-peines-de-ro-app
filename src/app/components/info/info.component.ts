import { Component, Input, OnInit } from '@angular/core';
import { Servicio } from 'src/app/models/servicio.interface';
import { ModalController } from '@ionic/angular';
import { CalendarComponent } from '../calendar/calendar.component';
import { User } from 'firebase/auth';

@Component({
  selector: 'app-info',
  templateUrl: './info.component.html',
  styleUrls: ['./info.component.scss'],
})
export class InfoComponent implements OnInit {

  @Input() servicio: Servicio;
  @Input() usuario: User;

  constructor(
    public modalController: ModalController
  ) { }

  ngOnInit() {}

  reservar() {
    this.calendar(this.servicio, this.usuario);
    this.modalController.dismiss({
      dismissed: true
    });
  }

  async calendar(servicio: Servicio, usuario: User) {
    const modal = await this.modalController.create({
      component: CalendarComponent,
      cssClass: 'css-modal',
      componentProps: {
        servicio,
        usuario,
      }
    });

    return await modal.present();
  }
}
