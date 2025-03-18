// Copyright (c) 2024 Triveni Digital, Inc. All rights reserved.

import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Observable} from 'rxjs';
import {SnmpSettings, SNMPSettingsUpdate} from '../models/snmp';
import {environment} from '../../../environments/environment';

const httpOptions = {
  headers: new HttpHeaders({'Content-Type': 'application/json'}),
};

@Injectable({
  providedIn: 'root',
})
export class SnmpService {
  constructor(private http: HttpClient) {
  }

  public getSnmpSettings(): Observable<SnmpSettings> {
    return this.http.get<SnmpSettings>(`${environment.DEVSERVERAPI_URL}/snmpSettings`, httpOptions);
  }

  public snmpSettingsUpdate(snmpSettingsUpdate: SNMPSettingsUpdate, requestId: string): Observable<SnmpSettings> {
    const url = `${environment.DEVSERVERAPI_URL}/updateSNMPSettings?requestId=` + requestId;
    localStorage.setItem('lastCommitUpdateRequestId', requestId);
    return this.http.post<SnmpSettings>(url, snmpSettingsUpdate, httpOptions);
  }
}
