import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';
import { User } from 'firebase/auth';
import { FormBuilder, FormControl } from '@angular/forms';
import { ToastController, ActionSheetController } from '@ionic/angular';
import { AngularFireStorageReference, AngularFireUploadTask, AngularFireStorage } from '@angular/fire/compat/storage';
import { FileI } from '../../models/file.interface';
import { ServiciosService } from '../../services/servicios/servicios.service';
import { FavoritosService } from 'src/app/services/favoritos/favoritos.service';
import { Servicio } from 'src/app/models/servicio.interface';
import { Subscription } from 'rxjs';
import { take, takeWhile } from 'rxjs/operators';

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.page.html',
  styleUrls: ['./perfil.page.scss'],
})
export class PerfilPage implements OnInit, OnDestroy {
  public ref: AngularFireStorageReference;
  public afTask: AngularFireUploadTask;
  public file: FileI;
  public url: string;
  public isAlive = true;
  public usuario: User;
  public isLogged = false;
  public segment: string;
  public nombre = new FormControl('');
  public phone = new FormControl('');
  public reservas: boolean;
  public arrayFav: Array<string> = [];
  public servicios: Servicio[] = [];
  private sub: Subscription;

  constructor(
    public router: Router,
    private authSvc: AuthService,
    private servSvc: ServiciosService,
    private favSvc: FavoritosService,
    public toast: ToastController,
    public storage: AngularFireStorage,
    public actionSheetController: ActionSheetController
    ) { }

  async ngOnInit() {
    this.usuario = await this.authSvc.getUsuarioActual();

    if (this.usuario) {
      if (this.usuario.emailVerified === true) {
        this.isLogged = true;
        this.favSvc.getFavoritosconUID(this.usuario.uid)
          .pipe(take(1))
          .subscribe( favoritos => {
            this.arrayFav = favoritos.servicios;
          });

        this.sub = this.servSvc.getServicios()
          .pipe(take(1))
          .subscribe( servicios => {
            for (const servicio of servicios) {
              if (this.arrayFav.indexOf(servicio.id) !== -1) {
                this.servicios.push(servicio);
              }
            }
          });

        console.log(this.usuario);

        this.nombre.patchValue(this.usuario.displayName);
        this.phone.patchValue(this.usuario.phoneNumber);

      } else {
        this.router.navigate(['/verificar-email']);
      }
    }

    this.segment = 'reservas';
    this.reservas = false;
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
    console.log('Desuscrito');
  }

  segmentChanged(ev: any) {
    this.segment = ev.detail.value;
  }

  async guardarDatos() {
    const nombre = this.nombre.value;
    const phone = this.phone.value;

    if (nombre === '' || phone === '' || phone === null) {
      const toast = await this.toast.create({
        message: 'Error al guardar sus datos personales',
        duration: 2000,
        color: 'danger'
      });

      await toast.present();

    } else {
      this.authSvc.modificarNombre(nombre);
      const toast = await this.toast.create({
        message: 'El perfil se ha actualizado correctamente',
        duration: 2000,
        color: 'success'
      });

      await toast.present();
    }
  }

  handleImage(ev: any) {
    this.file = ev.target.files[0];
    const filePath = `images/${this.file.name}`;
    this.ref = this.storage.ref(filePath);
    this.afTask = this.ref.put(this.file);

    this.ref.getDownloadURL().subscribe( url => {
      this.authSvc.modificarAvatar(url);
    });
  }

  login() {
    this.router.navigate(['/login']);
  }

  async logout() {
    try {
      await this.authSvc.logout();
      window.location.href = 'login';
    } catch (error) {
      console.log(error);
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
          icon: 'bag-add'
        },
        {
          text: texto,
          icon: icono,
          handler: () => {
            if (this.isLogged) {
              const existe = this.arrayFav.indexOf(servicio.id);

              if (existe !== -1) {
                const array = this.arrayFav.filter((item) => item !== servicio.id);
                this.favSvc.updateFavorito(array, this.usuario.uid);
                this.arrayFav = array;
                const arrayServ = this.servicios.filter((item) => item.id !== servicio.id);
                this.servicios = arrayServ;
              }
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

}
