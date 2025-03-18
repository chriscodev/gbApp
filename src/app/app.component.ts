/*
 * Copyright (c) 2023-2024 Triveni Digital, Inc. All rights reserved.
 */

import {
  Component,
  Injectable,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ClientModelCollection } from './core/models/ClientModelCollection';

@Injectable()
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit, OnDestroy {
  destroy$: Subject<boolean> = new Subject<boolean>();

  constructor(
    private router: Router,
    private clientModelCollection: ClientModelCollection
  ) {
  }
  ngOnInit(): void {
    if (localStorage?.getItem('currentUser')) {
      console.log('AppComponent user refreshed page');
      this.clientModelCollection.refresh();
    }
    this.router.events.pipe(takeUntil(this.destroy$)).subscribe((evt) => {
      if (evt instanceof NavigationEnd) {
        this.router.navigated = false;
        window.scrollTo(0, 0);
      }
    });
  }

  ngOnDestroy() {
    this.destroy$.next(null);
    this.destroy$.complete();
    this.destroy$.unsubscribe();
  }
}
