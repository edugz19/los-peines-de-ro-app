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
import { ReservasService } from '../../services/reservas/reservas.service';
import { Reserva } from 'src/app/models/reserva.interface';
import * as moment from 'moment';

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.page.html',
  styleUrls: ['./perfil.page.scss'],
})
export class PerfilPage implements OnInit {
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
  public arrayFav: Array<string> = [];
  public arrayReservas: Array<Reserva> = [];
  public servicios: Servicio[] = [];

  constructor(
    public router: Router,
    private authSvc: AuthService,
    public toast: ToastController,
    public storage: AngularFireStorage,
    public actionSheetController: ActionSheetController
    ) { }

  async ngOnInit() {
    this.usuario = await this.authSvc.getUsuarioActual();

    if (this.usuario) {
      if (this.usuario.emailVerified === true) {
        this.isLogged = true;

        console.log(this.usuario);

        this.nombre.patchValue(this.usuario.displayName);
        this.phone.patchValue(this.usuario.phoneNumber);

      } else {
        this.router.navigate(['/verificar-email']);
      }
    }

    this.segment = 'reservas';
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

}
