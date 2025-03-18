import { Component, OnInit, OnDestroy } from '@angular/core';

interface IPerson {
  id: number;
  firstName: string;
  lastName: string;
  state: string;
}
declare var _: any;
declare var $;
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  providers: [],
})
export class HomeComponent implements OnInit, OnDestroy {
  pageTitle = 'HomeComponent';
  constructor() {}
  ngOnInit(): void {}

  ngOnDestroy() {
    console.log('ngOnDestroy');
  }
}
