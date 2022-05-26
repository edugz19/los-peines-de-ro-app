import { Component, OnInit } from '@angular/core';
import { CarouselItem } from '../../models/carouselItem.interface';
import { CAROUSEL_DATA_ITEMS } from '../../constants/carousel.const';
import { User } from 'firebase/auth';
import { AuthService } from '../../services/auth/auth.service';
import { Router } from '@angular/router';
import { Usuario } from '../../models/Usuario';
import { UsuariosService } from '../../services/usuarios/usuarios.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {

  public usuario: User;
  public nombre: string;
  public isLogged: boolean;
  public modoOscuro: boolean;

  // public carouselData: CarouselItem[] = CAROUSEL_DATA_ITEMS;
  constructor(
    private authSvc: AuthService,
    public router: Router,
    public usuarioSvc: UsuariosService
  ) {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
    if (prefersDark.matches) {
      this.modoOscuro = true;
    } else {
      this.modoOscuro = false;
    }
  }

  async ngOnInit() {
    this.usuario = await this.authSvc.getUsuarioActual();

    if (this.usuario) {
      this.nombre = this.usuario.displayName.split(' ')[0];
      this.isLogged = true;

      this.usuarioSvc.getUsuario(this.usuario.uid).subscribe( usuario => {
        if (usuario === undefined) {
           const usuarioActual = {
            uid: this.usuario.uid,
            displayName: this.usuario.displayName,
            email: this.usuario.email
          };
          this.usuarioSvc.crearUsuario(this.usuario.uid, usuarioActual);
        }
      });

      console.log(this.usuario);
    }
  }

}
