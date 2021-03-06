/* eslint-disable @typescript-eslint/member-ordering */
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth/auth.service';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  ocultarPass = true;
  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    pass: ['', [Validators.required]]
  });

  constructor(
    public router: Router,
    private fb: FormBuilder,
    private authSvc: AuthService,
    public toast: ToastController
  ) { }

  ngOnInit() {
  }

  async login() {
    const { email, pass } = this.loginForm.value;

    try {
      const usuario = await this.authSvc.login(email, pass);
      if (usuario) {
        window.location.href = 'perfil';
      }

    } catch(error) {
      // console.log(error);
    }
  }

  async loginGoogle() {
    const result = await this.authSvc.loginGoogle();
    window.location.href = 'perfil';
    return result;
  }

  registrar(): void {
    this.router.navigate(['registro']);
  }

  mostrarError(campo: string): string {
    let mensaje = '';

    if (this.loginForm.get(campo)?.errors?.required) {
      mensaje = 'Debes rellenar este campo';
    } else if (this.loginForm.get(campo)?.hasError('email')) {
      mensaje = 'Email inválido';
    }

    return mensaje;
  }

  esValido(campo: string): boolean {
    return (
      this.loginForm.get(campo)?.dirty &&
      this.loginForm.get(campo)?.invalid
    );
  }

}
