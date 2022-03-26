import { Pipe, PipeTransform } from '@angular/core';
import { ServiciosService } from '../services/servicios/servicios.service';
import { Servicio } from '../models/servicio.interface';

@Pipe({
  name: 'filter'
})
export class FilterPipe implements PipeTransform {

  servicios: Servicio[] = [];
  serviciosTemp: Servicio[] = [];

  constructor(
    private servSvc: ServiciosService
  ) {
    this.servSvc.getServicios().subscribe( servicios => this.servicios = servicios );
  }

  transform(value: any, arg: string): any {
    if (arg === '') {
      return this.servicios;
    } else {
      this.serviciosTemp = [];
      for(const servicio of this.servicios){
        if(servicio.nombre.includes(arg)){
           this.serviciosTemp.push(servicio);
        };
      };
      return this.serviciosTemp;
    }
  }

}
