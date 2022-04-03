import { Component, OnInit } from '@angular/core';
import { ModalController, ActionSheetController } from '@ionic/angular';
import { ServiciosService } from 'src/app/services/servicios/servicios.service';
import { Categoria } from '../../models/categoria.interface';
import { Servicio } from '../../models/servicio.interface';
import { CategoriasService } from '../../services/categorias/categorias.service';
import { InfoModalPage } from '../info-modal/info-modal.page';

@Component({
  selector: 'app-servicios',
  templateUrl: './servicios.page.html',
  styleUrls: ['./servicios.page.scss'],
})
export class ServiciosPage implements OnInit {
  categorias: Categoria[] = [];
  servicios: Servicio[] = [];
  serviciosTemp: Servicio[] = [];
  categoriasTemp: Categoria[] = [];
  sinResultados: boolean;

  constructor(
    private catSvc: CategoriasService,
    private servSvc: ServiciosService,
    public modalController: ModalController,
    public actionSheetController: ActionSheetController
  ) {}

  ngOnInit() {
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

  async openModal(servicio: Servicio) {
    const modal = await this.modalController.create({
      component: InfoModalPage,
      cssClass: 'css-modal',
      componentProps: {
        servicio: servicio.nombre,
        descripcion: servicio.descripcion,
        precio: servicio.precio,
        duracion: servicio.duracion
      }
    });

    return await modal.present();
  }

  async openActionSheet(servicio: Servicio) {
    const actionSheet = this.actionSheetController.create({
      header: servicio.nombre.toUpperCase(),
      cssClass: 'my-css-class',
      buttons: [
        {
          text: 'Reservar',
          icon: 'bag-add'
        },
        {
          text: 'Añadir a favoritos',
          icon: 'heart-outline'
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
}
