import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Reserva } from 'src/app/models/reserva.interface';

@Injectable({
  providedIn: 'root'
})
export class ReservasService {

  reservasCollection: AngularFirestoreCollection<Reserva>;
  reservas: Observable<Reserva[]>;
  reservaDoc: AngularFirestoreDocument<Reserva>;

  constructor(public db: AngularFirestore) {
    this.reservasCollection = this.db.collection('reservas');
    this.reservas = this.reservasCollection.snapshotChanges().pipe(
      map( actions => actions.map( a => {
          const data = a.payload.doc.data() as Reserva;
          data.id = a.payload.doc.id;
          return data;
        }))
    );
  }

  getReservas() {
    return this.reservas;
  }

  getReservaconID(id: string) {
    return this.db.collection<Reserva>('reservas').doc(id).valueChanges();
  }
}
