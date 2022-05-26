import { Component, OnInit, OnDestroy } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';
import { User } from 'firebase/auth';
import { FormControl } from '@angular/forms';
import { ToastController, ActionSheetController } from '@ionic/angular';
import { AngularFireStorageReference, AngularFireUploadTask, AngularFireStorage } from '@angular/fire/compat/storage';
import { FileI } from '../../models/file.interface';
import { Servicio } from 'src/app/models/servicio.interface';
import { Reserva } from 'src/app/models/reserva.interface';
import { filter } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { UsuariosService } from '../../services/usuarios/usuarios.service';
import { Usuario } from '../../models/Usuario';

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
  public cambiandoImagen: boolean;
  public isAlive = true;
  public usuario: User;
  public isLogged = false;
  public segment: string;
  public nombre = new FormControl('');
  public arrayFav: Array<string> = [];
  public arrayReservas: Array<Reserva> = [];
  public servicios: Servicio[] = [];

  public subscriber: Subscription;

  constructor(
    public router: Router,
    private authSvc: AuthService,
    public usuariosSvc: UsuariosService,
    public toast: ToastController,
    public storage: AngularFireStorage,
    public actionSheetController: ActionSheetController
    ) {
      this.subscriber = this.router.events.pipe(
        filter(event => event instanceof NavigationEnd)
      ).subscribe((event: any) => {
         this.segment = 'reservas';
      });

      this.cambiandoImagen = false;
    }

  async ngOnInit() {
    this.usuario = await this.authSvc.getUsuarioActual();

    if (this.usuario) {
      if (this.usuario.emailVerified === true) {
        this.isLogged = true;

        this.usuariosSvc.getUsuario(this.usuario.uid).subscribe( usuario => {
          if (usuario === undefined) {
            const usuarioActual = {
              uid: this.usuario.uid,
              displayName: this.usuario.displayName,
              email: this.usuario.email
            };
            this.usuariosSvc.crearUsuario(this.usuario.uid, usuarioActual);
          }
        });

        console.log(this.usuario);

        this.nombre.patchValue(this.usuario.displayName);

      } else {
        this.router.navigate(['/verificar-email']);
      }
    }

    this.segment = 'reservas';
  }

  ngOnDestroy() {
    this.subscriber?.unsubscribe();
 }

  segmentChanged(ev: any) {
    this.segment = ev.detail.value;
  }

  async guardarDatos() {
    const nombre = this.nombre.value;

    if (nombre === '') {
      const toast = await this.toast.create({
        message: 'Error al guardar sus datos personales',
        duration: 2000,
        color: 'danger'
      });

      await toast.present();

    } else {
      this.authSvc.modificarNombre(nombre);
      const usuario: Usuario = {
        uid: this.usuario.uid,
        displayName: nombre,
        email: this.usuario.email
      };
      this.usuariosSvc.updateUsuario(this.usuario.uid, usuario);
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

    this.cambiandoImagen = true;

    setTimeout(() => {
      this.ref.getDownloadURL().subscribe( url => {
        this.authSvc.modificarAvatar(url);
      });
    }, 2000);

    setTimeout(() => this.cambiandoImagen = false, 4000);
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
