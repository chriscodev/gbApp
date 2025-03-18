/*
 * Copyright (c) 2024 Triveni Digital, Inc. All rights reserved.
 */

import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {numberOnly} from 'src/app/shared/helpers/appWideFunctions';
import {AbstractFetchableScheduleProvider} from '../../../../../core/models/dtv/schedule/ScheduleProvider';
import {isDefined} from '../../../../../core/models/dtv/utils/Utils';
import {cloneDeep} from 'lodash';
import {inRangeCheck} from '../../../../helpers/mathHelprrs';

@Component({
  selector: 'app-modal-sp-schedule-download-settings',
  templateUrl: './modal-sp-schedule-download-settings.component.html',
  styleUrls: ['./modal-sp-schedule-download-settings.component.scss']
})
export class ModalSpScheduleDownloadSettingsComponent implements OnInit, OnChanges {
  @Input() scheduleProvider: AbstractFetchableScheduleProvider;
  @Output() downloadSettingsChanged: EventEmitter<AbstractFetchableScheduleProvider> = new EventEmitter();
  public readonly numberOnly = numberOnly;
  public daysAheadIconText: string;
  public intervalInMinutesIconText: string;
  public timeOfDayIconText: string;
  private daysAheadValid: boolean;
  private intervalInMinutesValid: boolean;
  private timeOfDayValid: boolean;
  private okEnabled: boolean;

  constructor() {
  }

  public ngOnInit(): void {
    if (isDefined(this.scheduleProvider)) {
      this.scheduleProvider = cloneDeep(this.scheduleProvider);
    }
  }

  public ngOnChanges(changes: SimpleChanges) {
    if (isDefined(changes.scheduleProvider)) {
      this.scheduleProvider = changes.scheduleProvider.currentValue;
      this.updateDownloadSettingsValid();
    }
  }

  public inputDownloadSettings(): void {
    this.updateDownloadSettingsValid();
  }

  private updateDownloadSettingsValid(): void {
    this.updateDaysAheadValid();
    this.updateIntervalInMinutesValid();
    this.updateTimeOfDayValid();
    this.downloadSettingsChangedHandler();
  }


  private downloadSettingsChangedHandler(): void {
    this.okEnabled = this.daysAheadValid && (this.intervalInMinutesValid || this.timeOfDayValid);
    if (this.okEnabled) {
      this.downloadSettingsChanged.emit(this.scheduleProvider);
    }
  }

  private updateDaysAheadValid(): void {
    this.daysAheadValid = inRangeCheck(this.scheduleProvider.daysAheadToProcess, 1, 64);
    this.daysAheadIconText = this.daysAheadValid ? 'text-success' : 'text-danger';
  }

  private updateIntervalInMinutesValid(): void {
    this.intervalInMinutesValid = this.scheduleProvider.updateDaily || inRangeCheck(
      this.scheduleProvider.intervalInMinutes, 1, 2147483647);
    this.intervalInMinutesIconText = this.intervalInMinutesValid ? 'text-success' : 'text-danger';
  }

  private updateTimeOfDayValid(): void {
    this.timeOfDayValid = this.scheduleProvider.updateDaily && this.scheduleProvider.timeOfDay?.length > 0;
    this.timeOfDayIconText = this.timeOfDayValid ? 'text-success' : 'text-danger';
  }

}
