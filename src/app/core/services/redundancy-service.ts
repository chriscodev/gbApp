// Copyright (c) 2024-2025 Triveni Digital, Inc. All rights reserved.

import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {environment} from '../../../environments/environment';
import {RedundancySettings, RedundancyStatus} from '../models/server/Redundancy';

const httpOptions = {
  headers: new HttpHeaders({'Content-Type': 'application/json'}),
};

@Injectable({providedIn: 'root'})
export class RedundancyService {
  constructor(private http: HttpClient) {
  }

  public getRedundancySettings(): Observable<RedundancySettings> {
    const url = `${environment.DEVSERVERAPI_URL}/redundancySettings`;
    return this.http.get<RedundancySettings>(url, httpOptions);
  }

  public updateRedundancySettings(redundancySettings: RedundancySettings,
                                  requestId: string): Observable<RedundancySettings> {
    const url = `${environment.DEVSERVERAPI_URL}/updateRedundancySettings?requestId=` +
      requestId;
    localStorage.setItem('lastRedundancySettingsRequestId', requestId);
    return this.http.post<RedundancySettings>(url, redundancySettings, httpOptions);
  }

  public testRedundancySettings(redundancySettings: RedundancySettings): Observable<RedundancySettings> {
    const url = `${environment.DEVSERVERAPI_URL}/testRedundancySettings`;
    return this.http.post<RedundancySettings>(url, redundancySettings, httpOptions);
  }

  public getRedundancyStatus(): Observable<RedundancyStatus> {
    const url = `${environment.DEVSERVERAPI_URL}/redundancyStatus`;
    return this.http.get<RedundancyStatus>(url, httpOptions);
  }
}
