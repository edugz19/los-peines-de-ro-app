import { Component, OnInit } from '@angular/core';
import { ModalController, ActionSheetController, LoadingController, ToastController } from '@ionic/angular';
import { ServiciosService } from 'src/app/services/servicios/servicios.service';
import { Categoria } from '../../models/categoria.interface';
import { Servicio } from '../../models/servicio.interface';
import { CategoriasService } from '../../services/categorias/categorias.service';
import { FavoritosService } from '../../services/favoritos/favoritos.service';
import { User } from 'firebase/auth';
import { AuthService } from '../../services/auth/auth.service';
import { CalendarComponent } from '../../components/calendar/calendar.component';

@Component({
  selector: 'app-servicios',
  templateUrl: './servicios.page.html',
  styleUrls: ['./servicios.page.scss'],
})
export class ServiciosPage implements OnInit {
  usuario: User;
  categorias: Categoria[] = [];
  servicios: Servicio[] = [];
  serviciosTemp: Servicio[] = [];
  categoriasTemp: Categoria[] = [];
  sinResultados: boolean;
  isLogged: boolean;
  arrayFav: Array<string>;

  constructor(
    private catSvc: CategoriasService,
    private servSvc: ServiciosService,
    private favSvc: FavoritosService,
    public modalController: ModalController,
    public actionSheetController: ActionSheetController,
    public loadingController: LoadingController,
    public authSvc: AuthService,
    public toastController: ToastController
  ) {}

  async ngOnInit() {
    this.presentLoading();
    this.usuario = await this.authSvc.getUsuarioActual();

    if (this.usuario) {
      this.isLogged = true;
      this.favSvc.getFavoritosconUID(this.usuario.uid).subscribe( favoritos => {
        this.arrayFav = favoritos.servicios;
      });
    } else {
      this.isLogged = false;
    }

    this.catSvc
      .getCategorias()
      .subscribe((categorias) => (this.categorias = categorias));
    this.servSvc
      .getServicios()
      .subscribe((servicios) => (this.servicios = servicios));
    this.sinResultados = false;
  }

  buscarServicio(event: any) {
    const valor = event.target.value.toLowerCase();
    const input = (document.getElementById('select') as HTMLSelectElement);
    input.value = '00';

    if (valor === '') {
      this.serviciosTemp = this.servicios;
      this.categoriasTemp = this.categorias;
      this.sinResultados = false;
    } else {
      this.serviciosTemp = [];
      this.categoriasTemp = [];
      for (const servicio of this.servicios) {
        if (servicio.nombre.includes(valor)) {
          this.serviciosTemp.push(servicio);

          for (const categoria of this.categorias) {
            if (servicio.categoria === categoria.id) {
              const indice = this.categoriasTemp.map(categ => categ.id).indexOf(categoria.id);

              if (indice === -1) {
                this.categoriasTemp.push(categoria);
              }
            }
          }
        }
      }

      if (this.serviciosTemp.length === 0) {
        this.sinResultados = true;
      }

    }
  }

  buscarPorCategoria(event: any) {
    const valor = event.detail.value;
    const input = (document.getElementById('search') as HTMLInputElement);
    input.value = '';

    if (valor === '00') {
      this.serviciosTemp = this.servicios;
      this.categoriasTemp = this.categorias;
    } else {
      this.serviciosTemp = [];
      this.categoriasTemp = [];

      for (const servicio of this.servicios) {
        if (servicio.categoria === valor) {
          this.serviciosTemp.push(servicio);
        }
      }

      for (const categoria of this.categorias) {
        if (categoria.id === valor) {
          this.categoriasTemp.push(categoria);
        }
      }
    }
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

  async openReservaModal(servicio: Servicio) {
    const modal = await this.modalController.create({
      component: CalendarComponent,
      cssClass: 'css-modal',
      componentProps: {
        servicio
      }
    });

    return await modal.present();
  }

  async openActionSheet(servicio: Servicio) {
    let icono = 'heart-outline';
    let texto = 'Añadir a favoritos';

    if (this.isLogged) {
      if (this.arrayFav.indexOf(servicio.id) !== -1) {
        icono = 'heart';
        texto = 'Quitar de favoritos';
      }
    }

    const actionSheet = this.actionSheetController.create({
      header: servicio.nombre.toUpperCase(),
      cssClass: 'my-css-class',
      buttons: [
        {
          text: 'Reservar',
          icon: 'bag-add',
          handler: () => {
            this.openReservaModal(servicio);
          }
        },
        {
          text: texto,
          icon: icono,
          cssClass: 'fav',
          handler: () => {
            if (this.isLogged) {
              const existe = this.arrayFav.indexOf(servicio.id);

              if (existe === -1) {
                this.arrayFav.push(servicio.id);
                this.favSvc.updateFavorito(this.arrayFav, this.usuario.uid);
                const mensaje = 'Servicio añadido a favoritos correctamente';
                const color = 'success';
                this.favToast(mensaje, color);
              } else {
                const array = this.arrayFav.filter((item) => item !== servicio.id);
                this.favSvc.updateFavorito(array, this.usuario.uid);
                const mensaje = 'Servicio eliminado de favoritos correctamente';
                const color = 'warning';
                this.favToast(mensaje, color);
              }

            } else {
              const mensaje = 'Para poder añadir servicios a tus favoritos debes iniciar sesión.';
              const color = 'danger';
              this.favToast(mensaje, color);
            }
          }
        },
        {
          text: 'Ver más información',
          icon: 'information-circle'
        },
        {
          text: 'Volver atrás',
          role: 'cancel',
          icon: 'close'
        }
      ]
    });

    (await actionSheet).present();
  }

  async presentLoading() {
    const loading = await this.loadingController.create({
      message: 'Cargando servicios...',
      duration: 2000
    });
    await loading.present();
  }

  async favToast(mensaje: string, color: string) {
    const toast = this.toastController.create({
      message: mensaje,
      duration: 2000,
      color
    });

    (await toast).present();
  }
}
