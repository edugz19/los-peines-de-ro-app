import { Component } from '@angular/core';
import { VariablesGlobales } from './global/VariablesGlobales';
import { AngularFireRemoteConfig } from '@angular/fire/compat/remote-config';
import { AngularFireMessaging } from '@angular/fire/compat/messaging';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  constructor(
    private remote: AngularFireRemoteConfig,
    private variables: VariablesGlobales
  ) {
    this.remote.fetchAndActivate().then(() => {
      this.remote
        .getValue('imagen')
        .then((blob) => (this.variables.imagenBlob = blob.asString()));
    });
  }
}
