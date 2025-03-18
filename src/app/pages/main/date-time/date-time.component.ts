// Copyright (c) 2023-2025 Triveni Digital, Inc. All rights reserved.
import {DatePipe, formatDate} from '@angular/common';
import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {DateTimeService} from '../../../core/services/date-time.service';
import {DateTime, NtpServer, NtpServerType, TimeZoneMapping} from '../../../core/models/server/DateTime';
import {isDefined} from '../../../core/models/dtv/utils/Utils';
import {cloneDeep, isEqual} from 'lodash';
import {AbstractCommitRevertComponent} from '../abstracts/abstract-commit-revert.component';
import {SelectTimezoneComponent} from '../../../shared/components/utilities/select-timezone/select-timezone.component';
import {Observable} from 'rxjs';
import {ComponentCanDeactivate} from '../../../core/guards/canDeactivateGuard';
import * as moment from 'moment';

@Component({
  selector: 'app-date-time',
  templateUrl: './date-time.component.html',
  styleUrls: ['./date-time.component.scss']
})
export class DateTimeComponent extends AbstractCommitRevertComponent implements OnInit, OnDestroy, ComponentCanDeactivate {
  @ViewChild(SelectTimezoneComponent) selectTimezone: SelectTimezoneComponent;
  // Local and Server versions of DateTime being edited
  localDateTime: DateTime;
  // Additional fields visible in HTML template
  serverDate: string;
  serverTime: string;
  ntpStatusLines: string[];
  updatedTimeZone: string;
  timeZoneWindowsNameToTimeZoneMappingMap: Map<string, TimeZoneMapping> = new Map<string, TimeZoneMapping>();
  ntpServerTypes = Object.values(NtpServerType);
  updatedNTPEnabled: boolean;
  updatedNTPServers: NtpServer[] = [];
  ntpServerRowIndexes: number[] = [];
  updateDateTimeModalOKValid = 'auto';
  updatedServerTimeString: string;
  // Private fields visible to implementation
  private baseServerTime: Date;
  private updatedServerTime: Date;
  private serverUpdateTimer: number;
  private ntpStatusVisible = false;
  private ntpStatusUpdateTimer: number;
  private maxNumberNTPServers = 5;
  private ntpServersValid = false;
  private serverDateTime: DateTime;

  constructor(
    private dateTimeService: DateTimeService) {
    super();
    for (let i = 0; i < this.maxNumberNTPServers; i++) {
      this.updatedNTPServers.push(new NtpServer('', NtpServerType.POOL, false));
      this.ntpServerRowIndexes.push(i);
    }
  }

  ngOnInit(): void {
    this.loadServerDateTime();
    this.loadTimeZones();
    this.serverUpdateTimer = window.setInterval(() => {
      if (isDefined(this.baseServerTime)) {
        this.baseServerTime = new Date(this.baseServerTime.getTime() + 1000);
        this.updateDateTimeFormat();
      }
    }, 1000);
  }

  ngOnDestroy(): void {
    clearInterval(this.serverUpdateTimer);
    this.cleanUpSubscriptions();
  }

  onCommit() {
    const observable: Observable<DateTime> = this.dateTimeService.postDateTime(this.localDateTime);
    const observer = {
      next: () => {
        this.loadServerDateTime();
        this.dirty = false;
      },
      error: (error: any) => {
        console.log('postDateTime ERROR', error);
      },
      complete: () => {
      }
    };
    this.subscriptions.push(observable.subscribe(observer));

  }

  onRevert() {
    this.localDateTime = cloneDeep(this.serverDateTime);
    this.updatedNTPEnabled = this.localDateTime.ntpEnabled;
    this.initializeUpdatedNtpServers();
    // Reload time from server on revert so have accurate server time
    this.loadServerDateTime();
    this.updateDirty();
  }

  updateDirty() {
    this.dirty = !isEqual(this.localDateTime, this.serverDateTime);
  }


  openNtpStatus() {
    this.ntpStatusVisible = true;
    this.loadNtpStatus();
    this.ntpStatusUpdateTimer = window.setInterval(() => {
      if (this.ntpStatusVisible) {
        this.loadNtpStatus();
      }
    }, 1000);
  }

  closeNtpStatus() {
    this.ntpStatusVisible = false;
    clearInterval(this.ntpStatusUpdateTimer);
  }

  openUpdateDateTime() {
    this.updatedNTPEnabled = this.localDateTime.ntpEnabled;
    this.initializeUpdatedNtpServers();
    this.updateNTPServerAddress();
    const datePipe: DatePipe = new DatePipe('en-US');
    this.updatedServerTimeString = datePipe.transform(this.baseServerTime, 'yyyy-MM-ddThh:mm:ss');
  }

  updateDateTimeSelectNTPServerType(index: number, $event: { target: { value: string; }; }) {
    const ntpServerTypeString: string = $event.target.value;
    this.updatedNTPServers[index].type = ntpServerTypeString as NtpServerType;
  }

  updateNTPServerAddress() {
    this.ntpServersValid = this.updatedNTPServers[0].address?.length > 0;
    this.updateDateTimeModalOKValid = !this.updatedNTPEnabled || this.ntpServersValid ? 'auto' : 'none';
  }

  updateDateTime($event: { target: { value: string | number | Date; }; }) {
    this.updatedServerTime = new Date($event.target.value);
  }

  closeUpdateDateTime(okSelected: boolean) {
    if (okSelected) {
      if (isDefined(this.localDateTime)) {
        this.localDateTime.ntpEnabled = this.updatedNTPEnabled;
        this.localDateTime.ntpServers = this.updatedNTPEnabled ? this.updatedNTPServers.filter(
          s => s.address?.length > 0) : [];
        if (isDefined(this.updatedServerTime)) {
          this.localDateTime.timeInMillis = this.updatedServerTime.getTime();
          this.baseServerTime = new Date(this.localDateTime.timeInMillis);
          this.updateDateTimeFormat();
        }
        this.updateDirty();
      }
    }
  }

  public updateParentHandler($event: { message: string; objType: DateTime; }) {
    if ($event.message === 'Close') {
      // @ts-ignore
      if ($event.objType.timeZoneMapping !== undefined) {
        this.localDateTime = $event.objType;
        this.updatedTimeZone = $event.objType?.timeZoneMapping?.windowsName;
        this.localDateTime.timeZoneMapping = this.timeZoneWindowsNameToTimeZoneMappingMap.get(
          this.updatedTimeZone);
        const timezone = $event.objType?.timeZoneMapping?.timeZone;

        clearInterval(this.serverUpdateTimer);
        setTimeout(() => {
          this.serverUpdateTimer = window.setInterval(() => {
            if (isDefined(this.baseServerTime)) {
              this.baseServerTime = new Date(this.localDateTime.timeInMillis);
              this.updateDateTimeFormat();
            }
          }, 1000);
        }, 100);
        this.updateDirty();
      }
      this.selectTimezone.closeModal();
    }
  }

  public dateTimeInTimezoneToMilliseconds(timezone: string) {
    const date = new Date(); // Current date and time in local timezone
    const options = {
      timeZone: timezone,
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric'
    };
    // @ts-ignore
    const formatter = new Intl.DateTimeFormat('en-US', options);
    const formattedDate = formatter.format(date);
    const dateTimeInTimezone = new Date(formattedDate);
    return dateTimeInTimezone.getTime();
  }

  public canDeactivate(): boolean {
    return !this.dirty;
  }

  private loadServerDateTime() {
    const observable: Observable<DateTime> = this.dateTimeService.getDateTime();
    const observer = {
      next: (dateTime: DateTime) => {
        if (isDefined(dateTime)) {
          this.serverDateTime = dateTime;
          this.localDateTime = cloneDeep(this.serverDateTime);
          this.baseServerTime = new Date(dateTime.timeInMillis);
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
    const momentInTimezone = moment(this.baseServerTime).tz(this.localDateTime.timeZoneMapping.timeZone);
    this.serverDate = moment(momentInTimezone).format('dddd, MMMM D, YYYY');
    this.serverTime = moment(momentInTimezone).format('h:mm:ss A');
  }

  private loadNtpStatus() {
    this.dateTimeService.getNtpStatus().subscribe(
      (ntpStatusLines) => {
        if (isDefined(ntpStatusLines)) {
          this.ntpStatusLines = ntpStatusLines;
        }
      }
    );
  }

  private loadTimeZones() {
    this.dateTimeService.getTimeZones().subscribe(
      (timeZones) => {
        if (isDefined(timeZones)) {
          timeZones.forEach(timeZone => {
            this.timeZoneWindowsNameToTimeZoneMappingMap.set(timeZone.windowsName, timeZone);
          });
        }
      }
    );
  }

  private initializeUpdatedNtpServers() {
    this.updatedNTPServers = cloneDeep(this.localDateTime.ntpServers);
    const remainingUnsetNTPServers = this.maxNumberNTPServers - this.updatedNTPServers.length;
    for (let i = 0; i < remainingUnsetNTPServers; i++) {
      this.updatedNTPServers.push(new NtpServer('', NtpServerType.POOL, false));
    }
  }

}
