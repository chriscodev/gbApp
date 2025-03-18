// Copyright (c) 2024 Triveni Digital, Inc. All rights reserved.

import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {ProgressBarDataInterface, ProgressBarType} from '../../../../core/interfaces/ProgressBarDataInterface';

@Component({
  selector: 'app-modal-progress-bar',
  templateUrl: './modal-progress-bar.component.html',
  styleUrls: ['./modal-progress-bar.component.scss'],
})


export class ModalProgressBarComponent implements OnInit {
  @Input() progressBarData: ProgressBarDataInterface;
  @Output() progressBarEmit: EventEmitter<any> = new EventEmitter();
  protected readonly ProgressBarType = ProgressBarType;

  constructor() {

  }

  ngOnInit(): void {
  }

  closeProgressBarModal() {
    if (this.progressBarData.options === 'restart') {
      this.progressBarEmit.emit('restart');
    } else {
      this.progressBarEmit.emit('close');
    }
  }

  ngOnChanges(): void {
    if (this.progressBarData?.progress === 100 && this.progressBarData?.type !== ProgressBarType.ERROR) {
      setTimeout(() => {
        console.log('closing modal');
        this.closeProgressBarModal();
      }, 1000);  // added time out to delay closing of modal if the file load is too quick
    }
  }
}
