import { Pipe, PipeTransform } from '@angular/core';
import { Servicio } from '../models/servicio.interface';
import { ServiciosService } from '../services/servicios/servicios.service';

@Pipe({
  name: 'select'
})
export class SelectPipe implements PipeTransform {

  servicios: Servicio[] = [];
  serviciosTemp: Servicio[] = [];

  constructor(
    private servSvc: ServiciosService
  ) {
    this.servSvc.getServicios().subscribe( servicios => this.servicios = servicios );
  }

  transform(value: any, arg: any): any {
    if (arg === '00') {
      return this.servicios;
    } else {
      this.serviciosTemp = [];
      for(const servicio of this.servicios){
        if(servicio.categoria === arg){
           this.serviciosTemp.push(servicio);
        };
      };
      return this.serviciosTemp;
    }
  }

}
