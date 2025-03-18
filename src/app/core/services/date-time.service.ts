// Copyright (c) 2023-2024 Triveni Digital, Inc. All rights reserved.

import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Observable} from 'rxjs';
import {DateTime, TimeZoneMapping} from '../models/server/DateTime';
import {environment} from '../../../environments/environment';

const httpOptions = {
  headers: new HttpHeaders({'Content-Type': 'application/json'}),
};

@Injectable({
  providedIn: 'root'
})
export class DateTimeService {
  constructor(private http: HttpClient) {
  }

  public getDateTime(): Observable<DateTime> {
    const url = `${environment.DEVSERVERAPI_URL}/timeRecord`;
    return this.http.get<DateTime>(url, httpOptions);
  }

  public getNtpStatus(): Observable<string[]> {
    const url = `${environment.DEVSERVERAPI_URL}/ntpStatus`;
    return this.http.get<string[]>(url, httpOptions);
  }

  public getTimeZones(): Observable<TimeZoneMapping[]> {
    const url = `${environment.DEVSERVERAPI_URL}/timeZones`;
    return this.http.get<TimeZoneMapping[]>(url, httpOptions);
  }

  public postDateTime(dataTime: DateTime): Observable<DateTime> {
    const url = `${environment.DEVSERVERAPI_URL}/timeRecord`;
    return this.http.post<DateTime>(url, dataTime, httpOptions);
  }
}
