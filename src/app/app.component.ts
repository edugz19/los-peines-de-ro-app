import { Component, OnInit } from '@angular/core';
import { VariablesGlobales } from './global/VariablesGlobales';
import { AngularFireRemoteConfig } from '@angular/fire/compat/remote-config';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent implements OnInit {
  constructor(
    private remote: AngularFireRemoteConfig,
    private variables: VariablesGlobales
  ) {
    this.remote.fetchAndActivate().then( () => {
      this.remote.getValue('imagen').then( (blob) => this.variables.imagenBlob = blob.asString());
    });
  }

  ngOnInit() {}
}
