import { Component, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { PerfilPage } from './pages/perfil/perfil.page';
import { HomePage } from './pages/home/home.page';
import { ServiciosPage } from './pages/servicios/servicios.page';
import { App, URLOpenListenerEvent } from '@capacitor/app';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  constructor() {}
}
