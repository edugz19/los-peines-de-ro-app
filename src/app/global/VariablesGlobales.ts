import { Injectable } from '@angular/core';
import { User } from 'firebase/auth';
import { Servicio } from '../models/servicio.interface';

@Injectable()
export class VariablesGlobales {
    public imagenBlob: string;

    constructor() {
        this.initialize();
    }

    initialize() {
        this.imagenBlob = '';
    }
}
