import { Component, OnInit } from '@angular/core';
import { CarouselItem } from '../../models/carouselItem.interface';
import { CAROUSEL_DATA_ITEMS } from '../../constants/carousel.const';
import { User } from 'firebase/auth';
import { AuthService } from '../../services/auth/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {

  public usuario: User;
  public nombre: string;
  public isLogged: boolean;
  public modoOscuro: boolean;

  // public carouselData: CarouselItem[] = CAROUSEL_DATA_ITEMS;
  constructor(
    private authSvc: AuthService,
    public router: Router
  ) { }

  async ngOnInit() {
    this.usuario = await this.authSvc.getUsuarioActual();

    if (this.usuario) {
      this.nombre = this.usuario.displayName.split(' ')[0];
      this.isLogged = true;
      console.log(this.usuario);
    }

    this.modoOscuro = window.matchMedia('(prefers-color-scheme: dark)').matches;
    console.log(this.modoOscuro);
  }

}
