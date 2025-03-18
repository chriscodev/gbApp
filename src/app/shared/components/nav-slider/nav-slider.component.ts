/*
 * Copyright (c) 2024 Triveni Digital, Inc. All rights reserved.
 */

import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {NgbNavChangeEvent} from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-nav-slider',
  templateUrl: './nav-slider.component.html',
  styleUrls: ['./nav-slider.component.scss']
})
export class NavSliderComponent implements OnInit {
  @Input() headerTabs: any[];
  @Input() activeId: any;
  @Output() activeIdChanged: EventEmitter<number> = new EventEmitter<number>();

  sliderStyles: any = {};

  constructor() {
  }

  ngOnInit() {
    this.updateSliderStyles();

  }


  onNavChange(event: NgbNavChangeEvent) {
    this.activeIdChanged.emit(event.nextId);
    setTimeout(() => this.updateSliderStyles(), 0);
  }

  public sliderBorder = 'left';

  updateSliderStyles() {
    const activeTabIndex = this.headerTabs.findIndex(tab => tab.activeId === this.activeId);

    const tabCount = this.headerTabs.length;
    if (activeTabIndex === 0) {
      this.sliderBorder = 'left';
    } else if (activeTabIndex === tabCount - 1) {
      this.sliderBorder = 'right';
    } else {
      this.sliderBorder = 'mid';
    }
    const widthPercentage = 100 / tabCount;
    const calculation = activeTabIndex * 100;
    this.sliderStyles = {
      width: `${widthPercentage}%`,
      transform: `translateX( ${calculation}%)`,
    };
  }
}
