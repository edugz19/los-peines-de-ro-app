/* eslint-disable @typescript-eslint/member-ordering */
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  ocultarPass = true;
  private emailValido = /\S+@\S+\.\S+/;
  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.pattern(this.emailValido)]],
    pass: ['', [Validators.required]]
  });

  constructor(
    public router: Router,
    private fb: FormBuilder,
    private authSvc: AuthService
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
      console.log(error);
    }
  }

  registrar(): void {
    this.router.navigate(['registro']);
  }

  mostrarError(campo: string): string {
    let mensaje = '';

    if (this.loginForm.get(campo)?.errors?.required) {
      mensaje = 'Debes rellenar este campo';
    } else if (this.loginForm.get(campo)?.hasError('pattern')) {
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
