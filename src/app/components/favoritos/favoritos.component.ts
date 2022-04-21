import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { ActionSheetController, ToastController } from '@ionic/angular';
import { User } from 'firebase/auth';
import { take } from 'rxjs/operators';
import { FavoritosService } from 'src/app/services/favoritos/favoritos.service';
import { ServiciosService } from 'src/app/services/servicios/servicios.service';
import { Servicio } from '../../models/servicio.interface';

@Component({
  selector: 'app-favoritos',
  templateUrl: './favoritos.component.html',
  styleUrls: ['./favoritos.component.scss'],
})
export class FavoritosComponent implements OnInit, OnDestroy {
  @Input() servicios: Servicio[] = [];
  @Input() usuario: User;

  public arrayFav: Array<string> = [];

  constructor(
    private favSvc: FavoritosService,
    private servSvc: ServiciosService,
    public toast: ToastController,
    public actionSheetController: ActionSheetController
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
          if (this.arrayFav.indexOf(servicio.id) !== -1) {
            this.servicios.push(servicio);
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

    if (this.arrayFav.indexOf(servicio.id) !== -1) {
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
        },
        {
          text: texto,
          icon: icono,
          handler: () => {
            const existe = this.arrayFav.indexOf(servicio.id);

            if (existe !== -1) {
              const array = this.arrayFav.filter(
                (item) => item !== servicio.id
              );
              this.favSvc.updateFavorito(array, this.usuario.uid);
              this.arrayFav = array;
              const arrayServ = this.servicios.filter(
                (item) => item.id !== servicio.id
              );
              this.servicios = arrayServ;
              const mensaje = 'Servicio eliminado de favoritos correctamente';
              const color = 'warning';
              this.favToast(mensaje, color);
            }
          },
        },
        {
          text: 'Ver más información',
          icon: 'information-circle',
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
}
