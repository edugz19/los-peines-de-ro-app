import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { User, UserProfile } from 'firebase/auth';
import { first } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private afAuth: AngularFireAuth) {}

  async register(email: string, password: string) {
    try {
      return await this.afAuth.createUserWithEmailAndPassword(email, password);
    } catch (error) {
      console.log(error);
    }
  }

  async login(email: string, password: string) {
    try {
      const result = await this.afAuth.signInWithEmailAndPassword(email, password);
      this.enviarEmailVerificacion();
      return result;

    } catch (error) {
      console.log(error);
    }
  }

  async logout() {
    await this.afAuth.signOut();
  }

  getUsuarioActual() {
    return this.afAuth.authState.pipe(first()).toPromise();
  }

  async enviarEmailVerificacion() {
    return (await this.afAuth.currentUser).sendEmailVerification();
  }

  async resetearPass(email: string): Promise<void> {
    try {
      return this.afAuth.sendPasswordResetEmail(email);
    } catch (error) {
      console.log(error);
    }
  }

  async modificarNombre(nombre: string) {
    return (await this.afAuth.currentUser).updateProfile({
      displayName: nombre
    });
  }
}
