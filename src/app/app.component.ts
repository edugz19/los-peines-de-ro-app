import { Component, OnInit } from '@angular/core';
import { Servicio } from './models/servicio.interface';
import { ServiciosService } from './services/servicios/servicios.service';
import { VariablesGlobales } from './global/VariablesGlobales';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent implements OnInit {
  constructor() {}

  ngOnInit() {}
}
