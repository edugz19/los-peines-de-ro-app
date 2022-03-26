import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';
import { User } from 'firebase/auth';

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.page.html',
  styleUrls: ['./perfil.page.scss'],
})
export class PerfilPage implements OnInit {
  usuario: User;
  isLogged = false;
  img: string;

  constructor(
    public router: Router,
    private authSvc: AuthService
    ) { }

  async ngOnInit() {
    this.usuario = await this.authSvc.getUsuarioActual();

    if (this.usuario) {
      if (this.usuario.emailVerified === true) {
        this.isLogged = true;
        this.img = this.usuario.photoURL;
        console.log(this.usuario);
      } else {
        this.router.navigate(['/verificar-email']);
      }
    }
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
