/* eslint-disable @typescript-eslint/member-ordering */
import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth/auth.service';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { comprobarPass } from '../../helpers/comprobarPass.validator';

@Component({
  selector: 'app-registro',
  templateUrl: './registro.page.html',
  styleUrls: ['./registro.page.scss'],
})
export class RegistroPage implements OnInit {
  ocultarPass = true;
  ocultarVerifPass = true;
  private tlf = /[0-9]{9}/;
  registroForm = this.fb.group({
    nombre: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    telefono: ['', [Validators.required, Validators.pattern(this.tlf)]],
    pass: ['', [Validators.required, Validators.minLength(8)]],
    verificarPass: ['', [Validators.required, Validators.minLength(8)]]
  },
  {
    validators: comprobarPass
  });

  constructor(
    private authSvc: AuthService,
    public router: Router,
    private fb: FormBuilder
  ) {}

  ngOnInit() {
  }

  async registro() {
    const { email, pass, nombre } = this.registroForm.value;

    try {
      const usuario = await this.authSvc.register(email, pass);

      if (usuario) {
        this.authSvc.modificarNombre(nombre);
        window.location.href = '/verificar-email';
      }

    } catch(error) {
      console.log(error);
    }
  }

  mostrarError(campo: string): string {
    let mensaje = '';

    if (this.registroForm.get(campo)?.errors?.required) {
      mensaje = 'Debes rellenar este campo';
    } else if (this.registroForm.get(campo)?.hasError('minlength')) {
      mensaje = 'La contraseña debe tener al menos ocho caracteres';
    } else if (this.registroForm.get(campo)?.hasError('email')) {
      mensaje = 'Email inválido';
    } else if (this.registroForm.get(campo)?.hasError('pattern')) {
      mensaje = 'Número de teléfono inválido';
    }

    return mensaje;
  }

  esValido(campo: string): boolean {
    return (
      this.registroForm.get(campo)?.dirty &&
      this.registroForm.get(campo)?.invalid
    );
  }

}
