// Copyright (c) 2023-2024 Triveni Digital, Inc. All rights reserved.

import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {environment} from '../../../environments/environment';
import {NetworkSettings, NICDescriptor, UpdateNetworkSettings} from '../models/server/NetworkSetting';
import {NICState} from '../models/server/Server';

const httpOptions = {
  headers: new HttpHeaders({'Content-Type': 'application/json'}),
};

@Injectable({
  providedIn: 'root',
})
export class NetworkSettingsService {
  public constructor(private http: HttpClient) {
  }

  public getNetworkSettings(): Observable<NetworkSettings> {
    const url = `${environment.DEVSERVERAPI_URL}/networkSettings`;
    return this.http.get<NetworkSettings>(url, httpOptions);
  }

  public updateNetworkSettings(updateNetworkSettings: UpdateNetworkSettings): Observable<UpdateNetworkSettings> {
    return this.http.post<UpdateNetworkSettings>(
      `${environment.DEVSERVERAPI_URL}/updateNetworkSettings`, updateNetworkSettings, httpOptions
    );
  }

  public getNetworkList(): Observable<NICDescriptor[]> {
    const url = `${environment.GBWEBAPP_URL}/ipStream/networkInterfaces`;
    return this.http.get <NICDescriptor[]>(url, httpOptions);
  }

  public getNICStates(): Observable<Map<string, NICState>> {
    const url = `${environment.DEVSERVERAPI_URL}/NICStates`;
    return this.http.get <Map<string, NICState>>(url, httpOptions);
  }
}
