// Copyright (c) 2024-2025 Triveni Digital, Inc. All rights reserved.

import {Component, ElementRef, EventEmitter, OnInit, Output, ViewChild,} from '@angular/core';
import {NgbModal, NgbModalOptions, NgbModalRef,} from '@ng-bootstrap/ng-bootstrap';
import {BnNgIdleService} from 'bn-ng-idle';
import {Subject} from 'rxjs';
import {ApiService} from 'src/app/core/services/api.service';

@Component({
  selector: 'app-timeout-modals',
  templateUrl: './timeout-modals.component.html',
  styleUrls: ['./timeout-modals.component.scss'],
  providers: [BnNgIdleService],
})


// CHILD COMPONENT
export class TimeoutModalsComponent implements OnInit {
  @Output() parentComponent = new EventEmitter<string>();
  @ViewChild('modalRef') modalRef: ElementRef;

  modalReference: NgbModalRef;
  modalOptions: NgbModalOptions;

  subject = new Subject<boolean>();
  interval: any;

  constructor(
    private modalService: NgbModal,
    private apiService: ApiService
  ) {
    this.modalOptions = {
      size: 'lg',
      windowClass: 'modal-holder',
      centered: true,
    };
  }

  ngOnInit(): void { }

  /******
   * Opens a modal due to 15 minutes of inactivity and prompts the user whether
   *  to stay in the application or to exit.Uses a countdown window of 30secs.
   */
  opentimeOutModal() {
    let counter = 30;
    this.modalReference = this.modalService.open(
      this.modalRef,
      this.modalOptions
    );
    if (!this.interval) {
      setTimeout(() => { this.stopTimeLogout(false); }, 29500);
      this.interval = setInterval(() => {
        counter--;
        const $seconds = document.querySelector('#countdown');
        if (counter >= 1 && $seconds) {
          $seconds.textContent = counter + ' second' + (counter === 1 ? '' : 's');
        }
        // user is forced autologout
        else if (counter === 0) {
          if (this.interval) {
            this.apiService.logout().subscribe(() => {
            });
            localStorage.removeItem('currentUser');
            window.location.href = '/gbApp';
            setTimeout(() => { window.location.href = location.href; }, 500);
            clearInterval(this.interval);
            this.interval = undefined;
          }
        }
      }, 1000);
    }

  }

  /******
   * clears interval
   * closes modal reference from open
   * calls a function in parent to perform a stop and reset timer for BnNgIdleService
   */
  stopTimeLogout(fromClick = true) {
    if (fromClick && this.interval) {
      clearInterval(this.interval);
      this.interval = undefined;
    }
    this.modalReference.dismiss();
    this.parentComponent.emit();
  }
}
