// Copyright (c) 2024 Triveni Digital, Inc. All rights reserved.

import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../environments/environment';
import {Observable} from 'rxjs';
import {EventLogMessage, GetruntimeLogsDownloadZipInfo} from '../models/server/EventLogMessage';

@Injectable({providedIn: 'root'})
export class ActivityLogService {
  constructor(private http: HttpClient) {
  }

  getEventLogs(): Observable<EventLogMessage[]> {
    const url = `${environment.DEVSERVERAPI_URL}/eventLogMessages`;
    return this.http.get<EventLogMessage[]>(url);
  }

  getRuntimeLogs(): Observable<string[]> {
    const url = `${environment.DEVSERVERAPI_URL}/runtimeLogList`;
    return this.http.get<string[]>(url);
  }

  getClearlogs(): Observable<any> {
    const url = `${environment.DEVSERVERAPI_URL}/clearRuntimeLogs`;
    return this.http.get(url);
  }

  getRuntimeLogsDownloadZipInfo(): Observable<GetruntimeLogsDownloadZipInfo> {
    const url = `${environment.DEVSERVERAPI_URL}/runtimeLogsDownloadZipInfo`;
    return this.http.get<GetruntimeLogsDownloadZipInfo>(url);
  }

  exportLogs(data): Observable<Blob> {
    const url = `${environment.DEVSERVERAPI_URL}/runtimeLogsDownloadZipInfo`;
    console.log(url);
    return this.http.get(url, {responseType: 'blob'});
  }

  getEventLogById(logId: number): Observable<EventLogMessage[]> {
    const url = `${environment.DEVSERVERAPI_URL}/eventLogMessages/` + logId;
    return this.http.get<EventLogMessage[]>(url);
  }
}
