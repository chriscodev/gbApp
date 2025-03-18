// Copyright (c) 2024-2025 Triveni Digital, Inc. All rights reserved.

import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges
} from '@angular/core';
import {
  ExportProfile,
  ServiceExportLinks,
  StreamScopeExportProfile
} from '../../../../../core/models/dtv/network/export/ExportProfile';
import {isUrlValid} from '../../../../helpers';

@Component({
  selector: 'app-modal-stream-scope-export',
  templateUrl: './modal-stream-scope-export.component.html',
  styleUrl: './modal-stream-scope-export.component.scss'
})
export class ModalStreamScopeExportComponent implements OnInit, OnDestroy, OnChanges {
  @Input({
    transform: (profile: ExportProfile): StreamScopeExportProfile => {
      return profile instanceof StreamScopeExportProfile ? profile : profile as StreamScopeExportProfile;
    }
  }) currentExportProfile: StreamScopeExportProfile;
  @Output() okEnabledChanged: EventEmitter<boolean> = new EventEmitter();
  public serviceExportLinks: ServiceExportLinks[];
  public urlIconText = '';
  private urlValid = false;
  private serviceLinksValid = false;
  private okEnabled = false;

  constructor(private cdr: ChangeDetectorRef) {
    this.loadServiceLinks();
  }

  ngOnInit(): void {
    this.loadServiceLinks();
    this.inputSettings();
  }

  ngOnChanges(changes: SimpleChanges): void {
  }

  ngOnDestroy(): void {
  }

  inputSettings() {
    this.updateURLValid();
    this.updateServiceExportLinks();
    this.updateOkEnabled();
  }

  public updateURLValid(): void {
    this.urlValid = this.currentExportProfile.url?.length > 0 && isUrlValid(this.currentExportProfile.url);
    this.urlIconText = this.urlValid ? 'text-success' : 'text-danger';
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
    this.okEnabled = this.urlValid && this.serviceLinksValid;
    this.okEnabledChanged.emit(this.okEnabled);
  }
}
