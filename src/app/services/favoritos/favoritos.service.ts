import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Favoritos } from 'src/app/models/favoritos.interface';

@Injectable({
  providedIn: 'root'
})
export class FavoritosService {

  favoritosCollection: AngularFirestoreCollection<Favoritos>;
  favoritos: Observable<Favoritos[]>;
  favoritoDoc: AngularFirestoreDocument<Favoritos>;

  constructor(public db: AngularFirestore) {
    this.favoritosCollection = this.db.collection('favoritos');
    this.favoritos = this.favoritosCollection.snapshotChanges().pipe(
      map( actions => actions.map( a => {
          const data = a.payload.doc.data() as Favoritos;
          data.uid = a.payload.doc.id;
          return data;
        }))
    );
  }

  getFavoritos() {
    return this.favoritos;
  }

  updateFavorito(array: Array<string>, uid: string) {
    this.db.collection('favoritos').doc(uid).update({
      uid,
      servicios: array
    });
  }

  getFavoritosconUID(uid: string) {
    return this.db.collection<Favoritos>('favoritos').doc(uid).valueChanges();
  }
}
