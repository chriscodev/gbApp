// Copyright (c) 2023-2024 Triveni Digital, Inc. All rights reserved.

import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Observable} from 'rxjs';
import {environment} from '../../../environments/environment';
import {
  AbstractScheduleProvider,
  FTPTestRequest,
  FTPTestResponse,
  HTTPTestRequest,
  HTTPTestResponse,
  OnConnectSearchRequest,
  OnConnectSearchResponse,
  RemoteFileResource,
  ScheduleProviderStatus,
  ScheduleProvidersUpdate,
  ScheduleSummary,
  TCPTestRequest,
  TCPTestResponse
} from '../models/dtv/schedule/ScheduleProvider';
import {Schedule} from '../models/dtv/schedule/Schedule';
import {ServerResourceType} from '../models/server/Server';
import {isDefined} from '../models/dtv/utils/Utils';

const httpOptions = {
  headers: new HttpHeaders({'Content-Type': 'application/json'}),
};

@Injectable({
  providedIn: 'root',
})
export class ScheduleProviderService {
  constructor(private http: HttpClient) {
  }

  public getScheduleProviders(): Observable<AbstractScheduleProvider[]> {
    return this.http.get<AbstractScheduleProvider[]>(`${environment.DEVNETWORKURL}scheduleProviders`, httpOptions);
  }

  public getScheduleProviderById(scheduleId: number): Observable<AbstractScheduleProvider> {
    return this.http.get<AbstractScheduleProvider>(`${environment.DEVNETWORKURL}scheduleProvider/` + scheduleId,
      httpOptions);
  }

  public getScheduleById(scheduleId: number): Observable<Schedule> {
    return this.http.get<Schedule>(`${environment.DEVNETWORKURL}schedule/` + scheduleId, httpOptions);
  }

  public getScheduleProvidersSummary(): Observable<ScheduleSummary[]> {
    return this.http.get<ScheduleSummary[]>(`${environment.DEVNETWORKURL}schedulesSummary`, httpOptions);
  }

  public getScheduleProviderSummary(providerId: number): Observable<ScheduleSummary[]> {
    return this.http.get<ScheduleSummary[]>(`${environment.DEVNETWORKURL}scheduleSummary/` + providerId,
      httpOptions);
  }

  public getScheduleProvidersStatus(providerId: number): Observable<ScheduleProviderStatus> {
    if (!isDefined(providerId)) {
      // tslint:disable-next-line:no-console
      console.trace();
    }
    return this.http.get<ScheduleProviderStatus>(`${environment.DEVNETWORKURL}scheduleProviderStatus/` + providerId,
      httpOptions);
  }

  public scheduleProvidersUpdate(scheduleProvidersUpdate: ScheduleProvidersUpdate,
                                 requestId: string): Observable<ScheduleProvidersUpdate> {
    const url = `${environment.DEVNETWORKURL}scheduleProvidersUpdate?requestId=` +
      requestId;
    localStorage.setItem('lastCommitUpdateRequestId', requestId);
    return this.http.post<ScheduleProvidersUpdate>(url, scheduleProvidersUpdate, httpOptions);
  }

  public httpTest(httpTestRequest: HTTPTestRequest): Observable<HTTPTestResponse> {
    const url = `${environment.DEVNETWORKURL}httpTest`;
    return this.http.put<HTTPTestResponse>(url, httpTestRequest, httpOptions);
  }

  public ftpTest(ftpTestRequest: FTPTestRequest): Observable<FTPTestResponse> {
    const url = `${environment.DEVNETWORKURL}ftpTest`;
    return this.http.put<FTPTestResponse>(url, ftpTestRequest, httpOptions);
  }

  public tcpTest(tcpTestRequest: TCPTestRequest): Observable<TCPTestResponse> {
    const url = `${environment.DEVNETWORKURL}tcpTest`;
    return this.http.put<TCPTestResponse>(url, tcpTestRequest, httpOptions);
  }

  public onConnectSearch(onConnectSearch: OnConnectSearchRequest): Observable<OnConnectSearchResponse> {
    const url = `${environment.DEVNETWORKURL}onConnectSearch`;
    return this.http.put<OnConnectSearchResponse>(url, onConnectSearch);
  }

  public reconcileScheduleProviders(scheduleProviderIdList: ScheduleProviderIdList): Observable<ScheduleProviderIdList> {
    const url = `${environment.DEVNETWORKURL}reconcileScheduleProviders`;
    return this.http.post<any>(url, scheduleProviderIdList);
  }

  public getESGResourceDirectoryListing(): Observable<ServerResourceType> {
    return this.http.get<ServerResourceType>(`${environment.DEVSERVERAPI_URL}/resourceDirectoryListing/` +
      'esgPreview', httpOptions);
  }

  public getXSLTResourceDirectoryListing(): Observable<RemoteFileResource[]> {
    return this.http.get<RemoteFileResource[]>(`${environment.DEVSERVERAPI_URL}/resourceDirectoryListing/` +
      'XSLT', httpOptions);
  }
}

export class ScheduleProviderIdList {
  public constructor(public providerIds: number[]) {
  }
}
