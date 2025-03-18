// Copyright (c) 2024-2025 Triveni Digital, Inc. All rights reserved.

import {Component, OnInit} from '@angular/core';
import {resetTabSelectedClass} from 'src/app/shared/helpers/tableSelection';

@Component({
  selector: 'app-activity-log',
  templateUrl: './activity-log.component.html',
  styleUrls: ['./activity-log.component.scss'],
})
export class ActivityLogComponent implements OnInit {
  public headerTabs = [
    {tabName: 'Event Log Messages', activeId: 1},
    {tabName: 'Runtime Logs', activeId: 2}
  ];

  public activeId = 1;

  constructor() {
  }

  ngOnInit(): void {
  }

  public activeIdChangedHandler(id: number) {
    resetTabSelectedClass().then(r => r);
    this.activeId = id;
  }
}
