/*
 * Copyright (c) 2024 Triveni Digital, Inc. All rights reserved.
 */

import {ChangeDetectorRef, Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {
  ExportProfile,
  FTPExportProfile,
  ServiceExportLinks
} from '../../../../../core/models/dtv/network/export/ExportProfile';
import {numberOnly} from '../../../../helpers/appWideFunctions';
import {inRangeCheck} from '../../../../helpers/mathHelprrs';
import {BootstrapFunction} from '../../../../../core/interfaces/interfaces';

declare var $: BootstrapFunction;

@Component({
  selector: 'app-modal-ftp-export',
  templateUrl: './modal-ftp-export.component.html',
  styleUrl: './modal-ftp-export.component.scss'
})
export class ModalFtpExportComponent implements OnInit, OnDestroy {
  @Input({
    transform: (profile: ExportProfile): FTPExportProfile => {
      return profile instanceof FTPExportProfile ? profile : profile as FTPExportProfile;
    }
  }) currentExportProfile: FTPExportProfile;
  @Output() okEnabledChanged: EventEmitter<boolean> = new EventEmitter();
  public serviceExportLinks: ServiceExportLinks[];
  public passwordIconText = '';
  public userIconText = '';
  public portIconText = '';
  public hostIconText = '';
  public fileNameIconText = '';
  public pathIconText = '';
  public passText: string;
  public showTestConnection = false;
  portValid = false;
  hostValid = false;
  userValid = false;
  passwordValid = false;
  pathValid = false;
  fileNameValid = false;
  serviceLinksValid = false;
  okEnabled = false;
  shown = false;
  protected readonly numberOnly = numberOnly;

  constructor(private cdr: ChangeDetectorRef) {
  }

  ngOnInit(): void {
    this.loadServiceLinks();
  }

  ngOnDestroy(): void {
  }

  inputSettings() {
    this.updateHostValid();
    this.updateUserValid();
    this.updatePasswordValid();
    this.updatePortValid();
    this.updatePathValid();
    this.updateFileNameValid();
    this.updateServiceExportLinks();
    this.updateOkEnabled();
  }

  togglePass() {
    this.shown = !this.shown;
    this.passText = 'Show pass';
    if (this.shown) {
      this.passText = 'Hide pass';
    }
  }

  public updatePortValid(): void {
    this.portValid = inRangeCheck(this.currentExportProfile.port, 0, 65535);
    this.portIconText = this.portValid ? 'text-success' : 'text-danger';
  }

  public updateHostValid(): void {
    this.hostValid = this.currentExportProfile.host?.length > 0;
    this.hostIconText = this.hostValid ? 'text-success' : 'text-danger';
  }

  public updateUserValid(): void {
    this.userValid = this.currentExportProfile.user?.length > 0;
    this.userIconText = this.userValid ? 'text-success' : 'text-danger';
  }

  public updatePasswordValid(): void {
    this.passwordValid = this.currentExportProfile.password?.length > 0;
    this.passwordIconText = this.passwordValid ? 'text-success' : 'text-danger';
  }

  public updateFileNameValid(): void {
    this.fileNameValid = this.currentExportProfile.fileName?.length > 0;
    this.fileNameIconText = this.fileNameValid ? 'text-success' : 'text-danger';
  }

  public updatePathValid(): void {
    this.pathValid = this.currentExportProfile.path?.length > 0;
    this.pathIconText = this.pathValid ? 'text-success' : 'text-danger';
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
    this.okEnabled = this.portValid && this.pathValid && this.fileNameValid && this.hostValid && this.userValid && this.passwordValid
      && this.serviceLinksValid;
    this.okEnabledChanged.emit(this.okEnabled);
  }

  public testConnectionClosedHandler($event) {
    this.showTestConnection = false;
    $('#testFTPConnectionModal').modal('hide');
  }

  public doTestConnection(): void {
    this.showTestConnection = true;
  }
}
