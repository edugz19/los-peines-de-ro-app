import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { GoogleAuthProvider, User, UserProfile } from 'firebase/auth';
import { first } from 'rxjs/operators';
import { ToastController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(
    private afAuth: AngularFireAuth,
    public toast: ToastController
  ) {}

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
      this.presentToast();
    }
  }

  async loginGoogle() {
      return await this.AuthLogin(new GoogleAuthProvider());
  }

  // eslint-disable-next-line @typescript-eslint/naming-convention
  async AuthLogin(provider) {
    try {
      const result = await this.afAuth.signInWithPopup(provider);
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
      // console.log(error);
    }
  }

  async modificarNombre(nombre: string) {
    return (await this.afAuth.currentUser).updateProfile({
      displayName: nombre
    });
  }

  // async modificarTelefono() {
  //   return await (await this.afAuth.currentUser).updatePhoneNumber()
  // }

  async modificarAvatar(url: string) {
    return (await this.afAuth.currentUser).updateProfile({
      photoURL: url
    });
  }

  async presentToast() {
    const toast = await this.toast.create({
      message: 'El correo electrónico o la contraseña son incorrectos',
      duration: 2000,
      color: 'danger'
    });
    toast.present();
  }
}
