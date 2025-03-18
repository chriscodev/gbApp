// Copyright (c) 2023-2024 Triveni Digital, Inc. All rights reserved.

import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Observable} from 'rxjs';
import {environment} from '../../../environments/environment';
import {AbstractNetwork, NetworksUpdate} from '../models/dtv/network/logical/Network';
import {ServiceUuidDescriptor} from '../models/dtv/network/logical/Service';

const httpOptions = {
  headers: new HttpHeaders({'Content-Type': 'application/json'}),
};

@Injectable({
  providedIn: 'root',
})
export class NetworkService {
  constructor(private http: HttpClient) {
  }

  public getNetworks(): Observable<AbstractNetwork[]> {
    return this.http.get<AbstractNetwork[]>(`${environment.DEVNETWORKURL}networks`, httpOptions);
  }

  public getServiceUuids(): Observable<ServiceUuidDescriptor[]> {
    return this.http.get<ServiceUuidDescriptor[]>(`${environment.DEVNETWORKURL}network/serviceUuids`, httpOptions);
  }

  public networksUpdate(networksUpdate: NetworksUpdate, requestId: string): Observable<NetworksUpdate> {
    const url = `${environment.DEVNETWORKURL}networksUpdate?requestId=` + requestId;
    return this.http.post<NetworksUpdate>(url, networksUpdate, httpOptions);
  }
}
