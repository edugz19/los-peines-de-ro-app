import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Usuario } from 'src/app/models/Usuario';

@Injectable({
  providedIn: 'root'
})
export class UsuariosService {

  usuariosCollection: AngularFirestoreCollection<Usuario>;
  usuarios: Observable<Usuario[]>;
  usuarioDoc: AngularFirestoreDocument<Usuario>;

  constructor(public db: AngularFirestore) {
    this.usuariosCollection = this.db.collection('usuarios');
    this.usuarios = this.usuariosCollection.snapshotChanges().pipe(
      map( actions => actions.map( a => {
          const data = a.payload.doc.data() as Usuario;
          data.uid = a.payload.doc.id;
          return data;
        }))
    );
  }

  getUsuarios() {
    return this.usuarios;
  }

  crearUsuario(uid: string, usuario: Usuario) {
    this.db.collection('usuarios').doc(uid).set(usuario);
  }

  getUsuario(uid: string) {
    return this.db.collection<Usuario>('usuarios').doc(uid).valueChanges();
  }

  updateUsuario(uid: string, usuario: Usuario) {
    this.db.collection('usuarios').doc(uid).update(usuario);
  }
}
