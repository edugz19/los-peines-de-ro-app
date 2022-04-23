import { Component, OnInit, OnDestroy } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent implements OnInit {
  closed$ = new Subject<any>();
  showTabs = true;

  constructor(private router: Router) {}

  ngOnInit() {
    // eslint-disable-next-line no-underscore-dangle
    this.router.events
      .pipe(
        filter((e) => e instanceof NavigationEnd)
      )
      .subscribe((val: any) => {
        if (
          val.url === '/stripe-success' ||
          val.url === '/stripe-cancel'
        ) {
          this.showTabs = false;
        }
      });
  }
}
