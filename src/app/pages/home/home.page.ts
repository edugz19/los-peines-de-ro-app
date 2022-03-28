import { Component, OnInit } from '@angular/core';
import { CarouselItem } from '../../models/carouselItem.interface';
import { CAROUSEL_DATA_ITEMS } from '../../constants/carousel.const';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {

  public carouselData: CarouselItem[] = CAROUSEL_DATA_ITEMS;
  constructor() { }

  ngOnInit() {
  }

}
