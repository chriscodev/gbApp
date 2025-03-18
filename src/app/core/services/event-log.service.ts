// Copyright (c) 2023-2024 Triveni Digital, Inc. All rights reserved.

import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {environment} from '../../../environments/environment';
import {EventLogMessage, RuntimeLogsZipInfo} from '../models/server/EventLogMessage';

const httpOptions = {
  headers: new HttpHeaders({'Content-Type': 'application/json'}),
};

@Injectable({
  providedIn: 'root',
})
export class EventLogService {
  constructor(private http: HttpClient) {
  }

  public getEventLogMessages(): Observable<EventLogMessage[]> {
    const url = `${environment.DEVSERVERAPI_URL}/eventLogMessages`;
    return this.http.get<EventLogMessage[]>(url, httpOptions);
  }

  public getRuntimeLogList(): Observable<RuntimeLogsZipInfo> {
    const url = `${environment.DEVSERVERAPI_URL}/runtimeLogList`;
    return this.http.get<RuntimeLogsZipInfo>(url, httpOptions);
  }

  public clearLogs(): Observable<any> {
    const url = `${environment.DEVSERVERAPI_URL}/clearRuntimeLogs`;
    return this.http.get(url, httpOptions);
  }
}
