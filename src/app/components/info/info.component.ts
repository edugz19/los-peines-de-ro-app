import { Component, Input, OnInit } from '@angular/core';
import { Servicio } from 'src/app/models/servicio.interface';

@Component({
  selector: 'app-info',
  templateUrl: './info.component.html',
  styleUrls: ['./info.component.scss'],
})
export class InfoComponent implements OnInit {

  @Input() servicio: Servicio;

  constructor() { }

  ngOnInit() {}

}
