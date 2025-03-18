/*
 * Copyright (c) 2023-2024 Triveni Digital, Inc. All rights reserved.
 */
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
import {AbstractFetchableScheduleProvider} from '../../../../../core/models/dtv/schedule/ScheduleProvider';
import {isDefined} from '../../../../../core/models/dtv/utils/Utils';
import {BootstrapFunction} from '../../../../../core/interfaces/interfaces';
import {
  ModalSpScheduleDownloadSettingsComponent
} from '../modal-sp-schedule-download-settings/modal-sp-schedule-download-settings.component';

declare var $: BootstrapFunction;

@Component({
  selector: 'app-modal-sp-listings',
  templateUrl: './modal-sp-listings.component.html',
  styleUrls: ['./modal-sp-listings.component.scss'],
})
export class ModalSpListingsComponent implements OnInit, AfterViewInit, OnChanges {
  @Input() scheduleProvider: AbstractFetchableScheduleProvider;
  @Output() okEnabledChanged: EventEmitter<boolean> = new EventEmitter();
  @Output() spChanged: EventEmitter<{
    valid: boolean,
    scheduleProvider: AbstractFetchableScheduleProvider
  }> = new EventEmitter();
  @ViewChild(ModalSpScheduleDownloadSettingsComponent) downloadComponent: ModalSpScheduleDownloadSettingsComponent;

  public localScheduleProvider: AbstractFetchableScheduleProvider;
  public callLetters = '';
  public callLettersIconText: string;
  public okEnabled = false;
  public showTestConnection = false;
  public callLettersValid: boolean;
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
  ngAfterViewInit() {
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

  public validateLowerCaseOnly($event: KeyboardEvent): void {
    if (/^[A-Z ]+$/.test($event.key)) {
      $event.preventDefault();
    }
  }

  public inputSettings(): void {
    this.updateSettingsValid();
    this.updateUserPassword();
  }

  public updateUserPassword() {
    this.localScheduleProvider.user = this.callLetters + 'sftp';
    const passwordPrefix = this.localScheduleProvider.user.substring(0, 4);
    this.localScheduleProvider.password = passwordPrefix.split('')
      .map(c => c.charCodeAt(0).toString(16).padStart(2, '0'))
      .join('').toUpperCase();
    console.log('updateUserPassword ', this.localScheduleProvider.password);
  }

  private validateScheduleProvider(): void {
    this.updateCallLetters();
    this.updateSettingsValid();
  }

  private updateCallLetters(): void {
    if (this.localScheduleProvider?.user?.endsWith('sftp')) {
      this.callLetters = this.localScheduleProvider.user.substring(0, this.localScheduleProvider.user.length - 4);
    }
  }

  private updateSettingsValid(): void {
    this.updateCallLettersValid();
    this.updateOkEnabled();
  }

  private updateCallLettersValid(): void {
    this.callLettersValid = this.callLetters?.length > 0;
    this.callLettersIconText = this.callLettersValid ? 'text-success' : 'text-danger';
  }

  private updateOkEnabled(): void {
    this.okEnabled = this.callLettersValid && this.downloadSettingsOkEnabled;
    this.okEnabledChanged.emit(this.okEnabled);
  }


  downloadSettingsUpdated(scheduleProvider: AbstractFetchableScheduleProvider) {
    // to avoid other sp field override do not change in a scenarios when sp changes other properties and download component changes download fields
    this.localScheduleProvider.intervalInMinutes = scheduleProvider.intervalInMinutes;
    this.localScheduleProvider.timeOfDay = scheduleProvider.timeOfDay;
    this.localScheduleProvider.rateLimit = scheduleProvider.rateLimit;
    this.localScheduleProvider.updateDaily = scheduleProvider.updateDaily;
    this.localScheduleProvider.daysAheadToProcess = scheduleProvider.daysAheadToProcess;
  }
}
