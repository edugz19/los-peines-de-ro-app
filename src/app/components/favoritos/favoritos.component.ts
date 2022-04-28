import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import {
  ActionSheetController,
  ToastController,
  ModalController,
} from '@ionic/angular';
import { User } from 'firebase/auth';
import { take } from 'rxjs/operators';
import { FavoritosService } from 'src/app/services/favoritos/favoritos.service';
import { ServiciosService } from 'src/app/services/servicios/servicios.service';
import { Servicio } from '../../models/servicio.interface';
import { Subscription } from 'rxjs';
import { CalendarComponent } from '../calendar/calendar.component';
import { InfoComponent } from '../info/info.component';

@Component({
  selector: 'app-favoritos',
  templateUrl: './favoritos.component.html',
  styleUrls: ['./favoritos.component.scss'],
})
export class FavoritosComponent implements OnInit, OnDestroy {
  @Input() servicios: Servicio[] = [];
  @Input() usuario: User;

  public arrayFav: Array<string> = [];
  public arrayTemp: Array<Servicio> = [];

  public subscription: Subscription;

  constructor(
    private favSvc: FavoritosService,
    private servSvc: ServiciosService,
    public toast: ToastController,
    public actionSheetController: ActionSheetController,
    public modalController: ModalController
  ) {}

  ngOnInit() {
    this.favSvc.getFavoritosconUID(this.usuario.uid).subscribe((favoritos) => {
      if (favoritos === undefined) {
        this.favSvc.createFavoritos(this.usuario.uid);
      } else {
        this.arrayFav = favoritos.servicios;
      }
    });

    this.servSvc
      .getServicios()
      .pipe(take(1))
      .subscribe((servicios) => {
        for (const servicio of servicios) {
          if (this.arrayFav.includes(servicio.id)) {
            this.arrayTemp.push(servicio);
            console.log(this.arrayTemp);
          }
        }
      });
  }

  ngOnDestroy(): void {
    console.log('Favoritos destruido');
  }

  async openActionSheet(servicio: Servicio) {
    let icono = 'heart-outline';
    let texto = 'Añadir a favoritos';

    if (this.arrayFav.includes(servicio.id)) {
      icono = 'heart';
      texto = 'Quitar de favoritos';
    }

    const actionSheet = this.actionSheetController.create({
      header: servicio.nombre.toUpperCase(),
      cssClass: 'my-css-class',
      buttons: [
        {
          text: 'Reservar',
          icon: 'bag-add',
          handler: () => {
            this.openReservaModal(servicio, this.usuario);
          },
        },
        {
          text: texto,
          icon: icono,
          handler: () => {
            const existe = this.arrayFav.includes(servicio.id);

            if (existe) {
              const array = this.arrayFav.filter(
                (item) => item !== servicio.id
              );

              console.log(array);

              this.favSvc.updateFavorito(array, this.usuario.uid);
              this.arrayFav = array;

              this.arrayTemp = [];

              this.servSvc
                .getServicios()
                .pipe(take(1))
                .subscribe((servicios) => {
                  for (const serv of servicios) {
                    if (this.arrayFav.includes(serv.id)) {
                      this.arrayTemp.push(serv);
                      console.log(this.arrayTemp);
                    }
                  }
                });

              const mensaje = 'Servicio eliminado de favoritos correctamente';
              const color = 'warning';
              this.favToast(mensaje, color);
            }
          },
        },
        {
          text: 'Ver más información',
          icon: 'information-circle',
          handler: () => {
            this.openInfoModal(servicio);
          }
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

  async favToast(mensaje: string, color: string) {
    const toast = this.toast.create({
      message: mensaje,
      duration: 2000,
      color,
    });

    (await toast).present();
  }

  getHoras(min: number): string {
    let duracion: string;

    if (min >= 60) {
      const h = Math.floor(min / 60);

      if (min % 60 === 0) {
        duracion = `${h}h`;
      } else {
        const m = min % 60;
        duracion = `${h}h ${m}min`;
      }
    } else {
      duracion = `${min}min`;
    }

    return duracion;
  }

  truncarPrecio(precio: number): number {
    if (precio % 1 === 0) {
      return Math.trunc(precio);
    } else {
      return precio;
    }
  }

  async openReservaModal(servicio: Servicio, usuario: User) {
    const modal = await this.modalController.create({
      component: CalendarComponent,
      cssClass: 'css-modal',
      componentProps: {
        servicio,
        usuario,
      },
    });

    return await modal.present();
  }

  async openInfoModal(servicio: Servicio) {
    const modal = await this.modalController.create({
      component: InfoComponent,
      cssClass: 'info-modal',
      componentProps: {
        servicio
      },
    });

    return await modal.present();
  }
}
