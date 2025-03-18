// Copyright (c) 2024 Triveni Digital, Inc. All rights reserved.

import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import {numberOnly} from 'src/app/shared/helpers/appWideFunctions';
import {
  AbstractFetchableScheduleProvider,
  FETCH_TYPE,
  FETCH_TYPE_PORT,
  FetchType,
  RemoteFileResource
} from '../../../../../../core/models/dtv/schedule/ScheduleProvider';
import {isDefined} from '../../../../../../core/models/dtv/utils/Utils';
import {inRangeCheck} from '../../../../../helpers/mathHelprrs';
import {BootstrapFunction} from '../../../../../../core/interfaces/interfaces';
import {
  ModalSpScheduleDownloadSettingsComponent
} from '../../modal-sp-schedule-download-settings/modal-sp-schedule-download-settings.component';

declare var $: BootstrapFunction;

@Component({
  selector: 'app-modal-sp-ftp',
  templateUrl: './modal-sp-ftp.component.html',
  styleUrls: ['./modal-sp-ftp.component.scss']
})
export class ModalSpFtpComponent implements OnInit, OnChanges, AfterViewInit {
  @Input() scheduleProvider: AbstractFetchableScheduleProvider;
  @Output() okEnabledChanged: EventEmitter<boolean> = new EventEmitter();
  @ViewChild(ModalSpScheduleDownloadSettingsComponent) downloadComponent: ModalSpScheduleDownloadSettingsComponent;
  public readonly FETCH_TYPE = FETCH_TYPE;
  public readonly fetchTypes: FetchType[] = Object.values(FetchType);
  public readonly numberOnly = numberOnly;
  public passText: string;
  public localScheduleProvider: AbstractFetchableScheduleProvider;
  public okEnabled = false;
  public ftpSettingsValid: boolean;
  public showTestConnection = false;
  public showSelectTransformer = false;
  public hostIconText: string;
  public portIconText: string;
  public userIconText: string;
  public passwordIconText: string;
  public shown: boolean;
  private hostValid: boolean;
  private portValid: boolean;
  private userValid: boolean;
  private passwordValid: boolean;
  private downloadSettingsOkEnabled = true;

  constructor(private cdr: ChangeDetectorRef) {
  }

  public ngOnInit(): void {
    if (isDefined(this.scheduleProvider)) {
      this.localScheduleProvider = this.scheduleProvider;
      this.validateScheduleProvider();
    }
  }

  // to update the changes from download component to sp component use subscribe
  public ngAfterViewInit() {
    this.downloadComponent.downloadSettingsChanged.subscribe((scheduleProvider) => {
      this.downloadSettingsUpdated(scheduleProvider);
    });
  }


  public ngOnChanges(changes: SimpleChanges) {
    if (isDefined(changes.scheduleProvider)) {
      this.localScheduleProvider = changes.scheduleProvider.currentValue;
      this.validateScheduleProvider();
      this.cdr.detectChanges();
    }
  }

  public doTestConnection(): void {
    this.showTestConnection = true;
  }

  public testConnectionClosedHandler($event) {
    this.showTestConnection = false;
    $('#testConnectionModal').modal('hide');
  }

  public inputSettings(): void {
    this.updateSettingsValid();
  }

  public onProtocolChanged(): void {
    this.localScheduleProvider.port = FETCH_TYPE_PORT[this.localScheduleProvider.protocol].value;
  }

  public doChooseTransformer() {
    this.showSelectTransformer = true;
  }

  public xlstSelectedHandler(remoteFileResource: RemoteFileResource): void {
    this.xlstClosedHandler();
    this.localScheduleProvider.transformer = remoteFileResource.name;
    console.log('selectTransformatterHandler this.localScheduleProvider: ',
      JSON.stringify(this.localScheduleProvider));
  }

  public xlstClosedHandler() {
    this.showSelectTransformer = false;
    $('#selectXSLTModal').modal('hide');
  }

  public chooseToEmptyTransformer() {
    this.localScheduleProvider.transformer = undefined;
  }

  public togglePass() {
    this.shown = !this.shown;
    this.passText = 'Show pass';
    if (this.shown) {
      this.passText = 'Hide pass';
    }
  }

  private validateScheduleProvider(): void {
    this.updateSettingsValid();
  }

  private updateSettingsValid(): void {
    this.updateHostValid();
    this.updatePortValid();
    this.updateUserValid();
    this.updatePasswordValid();
    this.updateFTPSettingsValid();
    this.updateOkEnabled();
  }

  private downloadSettingsUpdated(scheduleProvider: AbstractFetchableScheduleProvider) {
    // to avoid other sp field override do not change in a scenarios when sp changes other properties and download component changes download fields
    this.localScheduleProvider.intervalInMinutes = scheduleProvider.intervalInMinutes;
    this.localScheduleProvider.timeOfDay = scheduleProvider.timeOfDay;
    this.localScheduleProvider.rateLimit = scheduleProvider.rateLimit;
    this.localScheduleProvider.updateDaily = scheduleProvider.updateDaily;
    this.localScheduleProvider.daysAheadToProcess = scheduleProvider.daysAheadToProcess;
  }

  private updateFTPSettingsValid(): void {
    this.ftpSettingsValid = this.hostValid && this.portValid && this.userValid && this.passwordValid;
  }

  private updateHostValid() {
    this.hostValid = this.localScheduleProvider.host?.length > 0;
    this.hostIconText = this.hostValid ? 'text-success' : 'text-danger';
  }

  private updatePortValid() {
    this.portValid = inRangeCheck(this.localScheduleProvider.port, 1, 65535);
    this.portIconText = this.portValid ? 'text-success' : 'text-danger';
  }

  private updateUserValid() {
    this.userValid = this.localScheduleProvider.user?.length > 0;
    this.userIconText = this.userValid ? 'text-success' : 'text-danger';
  }

  private updatePasswordValid() {
    this.passwordValid = this.localScheduleProvider.password?.length > 0;
    this.passwordIconText = this.passwordValid ? 'text-success' : 'text-danger';
  }

  private updateOkEnabled(): void {
    this.okEnabled = this.ftpSettingsValid && this.downloadSettingsOkEnabled;
    this.okEnabledChanged.emit(this.okEnabled);
  }
}
