// Copyright (c) 2024 Triveni Digital, Inc. All rights reserved.

import {Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges} from '@angular/core';
import {Observable, Subject, Subscription} from 'rxjs';
import {DateTime, TimeZoneMapping} from '../../../../core/models/server/DateTime';
import {isDefined} from '../../../../core/models/dtv/utils/Utils';
import {DateTimeService} from '../../../../core/services/date-time.service';
import {cloneDeep} from 'lodash';
import {formatDate} from '@angular/common';
import {ActionMessage} from '../../../../core/models/ui/dynamicTable';
import {BootstrapFunction} from '../../../../core/interfaces/interfaces';

declare let $: BootstrapFunction;

@Component({
  selector: 'app-select-timezone',
  templateUrl: './select-timezone.component.html',
  styleUrls: ['./select-timezone.component.scss']
})
export class SelectTimezoneComponent implements OnInit, OnDestroy, OnChanges {
  public subscriptions: Subscription[] = [];
  public destroy$: Subject<boolean> = new Subject<boolean>();
  @Input() required: boolean;
  @Input() data: string;
  @Input() btnLabel: string;
  @Input() icon: boolean;
  @Output() updateParent = new EventEmitter<any>();
  public overlay = false;

  public localDateTime: DateTime;
  timeZoneSearchField: string;
  updatedTimeZone: string;
  searchedTimeZones: string[];
  serverDate: string;
  serverTime: string;
  isTimezone: boolean;
  timeZoneWindowsNameToTimeZoneMappingMap: Map<string, TimeZoneMapping> = new Map<string, TimeZoneMapping>();
  disableOK = true;
  currentVal: string;
  private serverDateTime: DateTime;
  private baseServerTime: Date;
  private timeZoneOptions: string[];

  constructor(
    private dateTimeService: DateTimeService
  ) {
  }

  ngOnInit(): void {
    this.loadServerDateTime();
    this.loadTimeZones();
    this.isTimezone = this.icon;
  }

  openSelectTimeZone() {
    $('#timeZoneModal').modal('show');
    this.timeZoneSearchField = '';
    this.updatedTimeZone = this.currentVal;
    this.searchedTimeZones = Object.assign([], this.timeZoneOptions);
    const filterArray = this.searchedTimeZones?.filter((data) => data !== this.currentVal);
    this.searchedTimeZones = cloneDeep(filterArray);

  }

  public closeSelectTimeZone(okSelected: boolean) {
    this.timeZoneSearchField = '';
    const message = ActionMessage.CLOSE;
    let objType: {};
    let data: { message: ActionMessage; objType: {}; };
    if (okSelected) {
      if (isDefined(this.localDateTime)) {
        this.localDateTime.timeZoneMapping = this.timeZoneWindowsNameToTimeZoneMappingMap.get(
          this.updatedTimeZone);
      }
      objType = this.localDateTime;
    } else {
      objType = {};
    }
    data = {message, objType};
    this.disableOK = true;
    this.updateParent.emit(data);

  }

  public onSearchTimeZoneDropdownValue($event: any) {
    const value: string = $event.target.value;
    this.searchedTimeZones = this.timeZoneOptions.filter(
      option => option.toLowerCase().includes(value.toLowerCase()));
    this.disableOK = true;
    if (this.searchedTimeZones.length === 1) {
      this.updatedTimeZone = this.searchedTimeZones[0];
      this.disableOK = false;
    }
  }

  public onChangeTimeZone($event: Event) {
    this.disableOK = false;
  }

  public closeModal() {
    this.disableOK = true;
    $('#timeZoneModal').modal('hide');

  }

  ngOnChanges(changes: SimpleChanges) {
    const data = changes.data.currentValue;
    this.currentVal = data === undefined ? this.localDateTime?.timeZoneMapping?.windowsName : data;
    this.isTimezone = data !== 'Select Time Zone';

  }

  ngOnDestroy() {
    this.destroy$.next(null);
    this.destroy$.complete();
    this.destroy$.unsubscribe();
  }

  private loadServerDateTime() {
    const observable: Observable<DateTime> = this.dateTimeService.getDateTime();
    const observer = {
      next: (dateTime: DateTime) => {
        if (isDefined(dateTime)) {
          this.serverDateTime = dateTime;
          this.localDateTime = cloneDeep(this.serverDateTime);
          this.baseServerTime = new Date(dateTime.timeInMillis);
          this.updateDateTimeFormat();
        }
      },
      error: (error: any) => {
        console.log(`Error during loadServerTimeDate error ${error}`);
      },
      complete: () => {
      }
    };
    this.subscriptions.push(observable.subscribe(observer));
  }

  private updateDateTimeFormat() {
    this.serverDate = formatDate(this.baseServerTime, 'fullDate', 'en-us');
    this.serverTime = formatDate(this.baseServerTime, 'mediumTime', 'en-us');
  }

  private loadTimeZones() {
    this.dateTimeService.getTimeZones().subscribe(
      (timeZones) => {
        if (isDefined(timeZones)) {
          this.timeZoneOptions = [];
          timeZones.forEach(timeZone => {
            this.timeZoneOptions.push(timeZone.windowsName);
            this.timeZoneWindowsNameToTimeZoneMappingMap.set(timeZone.windowsName, timeZone);
          });
        }
      }
    );
  }
}
