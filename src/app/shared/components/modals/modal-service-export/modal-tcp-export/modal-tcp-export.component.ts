/*
 * Copyright (c) 2024 Triveni Digital, Inc. All rights reserved.
 */

import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges
} from '@angular/core';
import {
  ExportProfile,
  ServiceExportLinks,
  TCPExportProfile
} from '../../../../../core/models/dtv/network/export/ExportProfile';
import {inRangeCheck} from '../../../../helpers/mathHelprrs';
import {isIPAddressValid} from '../../../../helpers';

@Component({
  selector: 'app-modal-tcp-export',
  templateUrl: './modal-tcp-export.component.html',
  styleUrl: './modal-tcp-export.component.scss'
})
export class ModalTcpExportComponent implements OnInit, OnChanges {
  @Input({
    transform: (profile: ExportProfile): TCPExportProfile => {
      return profile instanceof TCPExportProfile ? profile : profile as TCPExportProfile;
    }
  }) currentExportProfile: TCPExportProfile;
  @Output() okEnabledChanged: EventEmitter<boolean> = new EventEmitter();
  public serviceExportLinks: ServiceExportLinks[];
  public portIconText = '';
  public adddressIconText = '';
  private addressValid = false;
  private serviceLinksValid = false;
  private okEnabled = false;
  private portValid = false;

  constructor(private cdr: ChangeDetectorRef) {
    this.loadServiceLinks();
  }

  ngOnInit(): void {
    this.loadServiceLinks();
    this.inputSettings();
  }

  ngOnChanges(changes: SimpleChanges): void {
  }

  inputSettings() {
    this.updateAddressValid();
    this.updatePortValid();
    this.updateServiceExportLinks();
    this.updateOkEnabled();
  }

  public updatePortValid(): void {
    this.portValid = inRangeCheck(this.currentExportProfile.port, 1025, 65535);
    this.portIconText = this.portValid ? 'text-success' : 'text-danger';
  }

  public updateAddressValid(): void {
    this.addressValid = isIPAddressValid(this.currentExportProfile.address);
    this.adddressIconText = this.addressValid ? 'text-success' : 'text-danger';
  }

  loadServiceLinks() {
    this.serviceExportLinks = this.currentExportProfile?.serviceLinks;
  }

  serviceLinksHandler(selectedServiceLinks: ServiceExportLinks[]) {
    this.currentExportProfile.serviceLinks = selectedServiceLinks;
    this.inputSettings();
    this.cdr.detectChanges();
  }

  updateServiceExportLinks() {
    this.serviceLinksValid = this.currentExportProfile.serviceLinks?.length > 0;
  }

  private updateOkEnabled(): void {
    this.okEnabled = this.portValid && this.portValid && this.addressValid && this.serviceLinksValid;
    this.okEnabledChanged.emit(this.okEnabled);
  }

}
