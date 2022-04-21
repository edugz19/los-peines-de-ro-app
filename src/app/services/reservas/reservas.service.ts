import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from '@angular/fire/compat/firestore';
import { User } from 'firebase/auth';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Reserva } from 'src/app/models/reserva.interface';
import { Servicio } from 'src/app/models/servicio.interface';
import { ToastController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class ReservasService {

  reservasCollection: AngularFirestoreCollection<Reserva>;
  reservas: Observable<Reserva[]>;
  reservaDoc: AngularFirestoreDocument<Reserva>;

  constructor(public db: AngularFirestore, public toastController: ToastController) {
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

  createReserva(reserva: Reserva) {
    this.db.collection('reservas').doc(reserva.id).set({
      id: reserva.id,
      uid: reserva.uid,
      nombre: reserva.nombre,
      servicio: reserva.servicio,
      horaInicio: reserva.horaInicio,
      horaFin: reserva.horaFin,
      fecha: reserva.fecha,
      precio: reserva.precio,
      pagado: reserva.pagado
    })
      .then(success => this.favToast('La cita se ha creado correctamente', 'success'))
      .catch(err => this.favToast('Error al crear la reserva', 'danger'));
  }

  async favToast(mensaje: string, color: string) {
    const toast = this.toastController.create({
      message: mensaje,
      duration: 2000,
      color
    });

    (await toast).present();
  }
}
