/* eslint-disable @typescript-eslint/member-ordering */
import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-recuperar-pass',
  templateUrl: './recuperar-pass.page.html',
  styleUrls: ['./recuperar-pass.page.scss'],
  providers: [AuthService]
})
export class RecuperarPassPage implements OnInit {
  private emailValido = /\S+@\S+\.\S+/;
  emailForm = this.fb.group({
    email: ['', [Validators.required, Validators.pattern(this.emailValido)]]
  });

  constructor(
    private fb: FormBuilder,
    private authSvc: AuthService,
    private router: Router
  ) { }

  ngOnInit() {
  }

  enviarEmail() {
    try {
      const {email} = this.emailForm.value;
      this.authSvc.resetearPass(email);
      window.alert('Correo enviado, revisa tu correo');
      this.router.navigate(['login']);
    } catch (error) {
      console.log(error);
    }
  }

  mostrarError(campo: string): string {
    let mensaje = '';

    if (this.emailForm.get(campo)?.errors?.required) {
      mensaje = 'Debes rellenar este campo';
    } else if (this.emailForm.get(campo)?.hasError('pattern')) {
      mensaje = 'Email inválido';
    }

    return mensaje;
  }

  esValido(campo: string): boolean {
    return (
      this.emailForm.get(campo)?.dirty &&
      this.emailForm.get(campo)?.invalid
    );
  }

}
