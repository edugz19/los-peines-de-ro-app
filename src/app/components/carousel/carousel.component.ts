import { Component, Input, OnInit } from '@angular/core';
import { CarouselItem } from 'src/app/models/carouselItem.interface';

@Component({
  selector: 'app-carousel',
  templateUrl: './carousel.component.html',
  styleUrls: ['./carousel.component.scss'],
})
export class CarouselComponent implements OnInit {

  @Input() height = 700;
  @Input() isFullScreen = false;
  @Input() items: CarouselItem[] = [];

  public finalHeight: string | number = 0;
  public currentPosition = 0;

  constructor() {
    this.finalHeight = '94vh';
  }

  ngOnInit() {
    this.items.map( (i, index) => {
      i.id = index;
      i.marginLeft = 0;
    });
  }

  setCurrentPosition(position: number) {
    this.currentPosition = position;
    this.items.find(i => i.id === 0).marginLeft = -100 * position;
  }

  setNext() {
    let finalPercentage = 0;
    let nextPosition = this.currentPosition + 1;
    if (nextPosition <= this.items.length - 1) {
      finalPercentage = -100 * nextPosition;
    } else {
      nextPosition = 0;
    }

    this.items.find(i => i.id === 0).marginLeft = finalPercentage;
    this.currentPosition = nextPosition;
  }

  setBack() {
    let finalPercentage = 0;
    let backPosition = this.currentPosition - 1;
    if (backPosition >= 0) {
      finalPercentage = -100 * backPosition;
    } else {
      backPosition = this.items.length - 1;
      finalPercentage = -100 * backPosition;
    }

    this.items.find(i => i.id === 0).marginLeft = finalPercentage;
    this.currentPosition = backPosition;
  }

}
