import { Injectable } from '@angular/core';
import { User } from 'firebase/auth';
import { Servicio } from '../models/servicio.interface';

@Injectable()
export class VariablesGlobales {
    public servicios: Servicio[];
    public usuario: User;

    constructor() {
        this.initialize();
    }

    initialize() {
        this.servicios = [];
        this.usuario = null;
    }
}
