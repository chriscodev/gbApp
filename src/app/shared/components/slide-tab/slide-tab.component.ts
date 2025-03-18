/*
 * Copyright (c) 2024 Triveni Digital, Inc. All rights reserved.
 */

import { Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {ButtonTypes, ConfirmMessageDialog, MultipleTableColumns} from '../../../core/models/ui/dynamicTable';
import {style} from '@angular/animations';

@Component({
  selector: 'app-slide-tab',
  templateUrl: './slide-tab.component.html',
  styleUrls: ['./slide-tab.component.scss']
})
export class SlideTabComponent implements OnInit {

  @Input() activeTabs: any;
  @Output() clickSelectedTab: EventEmitter<any> = new EventEmitter();
  constructor() { }

  ngOnInit(): void {
    this.initializeTabs();
  }

  initializeTabs(){
    console.log('initializeTabs: ', this.activeTabs);
    const navElement = document?.querySelector<HTMLElement>('.js-mod-nav');
    const slideRect = navElement?.querySelector<HTMLElement>('.nav__slider-rect');
    slideRect.style.width = 100 / this.activeTabs.length + '%';
    console.log(slideRect.style.width);
    for (let trav = 0; trav < this.activeTabs.length; trav++){
      this.activeTabs[trav].transformVal = (trav + 1) * 100;
    }
  }
  clickNav(evt, indexVal) {
    const navElement = document?.querySelector<HTMLElement>('.js-mod-nav');
    const navLinks = navElement?.querySelectorAll<HTMLElement>('.nav__link');
    const slideRect = navElement?.querySelector<HTMLElement>('.nav__slider-rect');
    slideRect.style.width = 100 / this.activeTabs.length + '%';
    if (!evt.target.classList?.contains('nav__link')) {
      return;
    }
    evt?.preventDefault();
    navLinks?.forEach((item) => {
      item.classList?.remove('nav__link_active');
    });
    if (!evt.target.classList?.contains('nav__link_active')) {
      evt.target.classList?.add('nav__link_active');
    }
    slideRect.style.transform = `translateX(${this.activeTabs[indexVal].transformVal - 100
    }%)`;
  }

  clickTab(selectedTab){
    this.clickSelectedTab.emit(selectedTab);
  }
}
