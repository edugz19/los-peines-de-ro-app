import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth/auth.service';
import { Observable } from 'rxjs';
import { User } from 'firebase/auth';

@Component({
  selector: 'app-verificar-email',
  templateUrl: './verificar-email.page.html',
  styleUrls: ['./verificar-email.page.scss']
})
export class VerificarEmailPage implements OnInit {
  email: string;
  usuario: User;

  constructor(
    private authSvc: AuthService
  ) { }

  async ngOnInit() {
    this.usuario = await this.authSvc.getUsuarioActual();

    if (this.usuario) {
      this.email = this.usuario.email;
    }
  }

  enviarEmail(): void {
    this.authSvc.enviarEmailVerificacion();
  }

}
