// Copyright (c) 2023-2024 Triveni Digital, Inc. All rights reserved.

import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {environment} from '../../../environments/environment';
import {
  LicenseRequest,
  NetworkLicenseInfo,
  NetworkLicenseSession,
  OfflineLicenseRequest,
  OfflineLicenseResponse,
  OnlineResponse,
  ServerLicenseInfo
} from '../models/server/License';

const httpOptions = {
  headers: new HttpHeaders({'Content-Type': 'application/json'}),
};

@Injectable({
  providedIn: 'root'
})
export class LicenseService {
  constructor(private http: HttpClient) {
  }

  public getServerLicenseInfo(): Observable<ServerLicenseInfo> {
    console.log(`LicenseService getServerLicenseInfo`);
    return this.http.get<ServerLicenseInfo>(
      `${environment.DEVSERVERAPI_URL}/serverLicenseInfo`, httpOptions);
  }

  public activateLicenseOnline(licenseRequest: LicenseRequest): Observable<OnlineResponse> {
    const url = `${environment.DEVSERVERAPI_URL}/activateLicenseOnline`;
    return this.http.post<OnlineResponse>(url, licenseRequest, httpOptions);
  }

  public refreshLicenseOnline(licenseRequest: LicenseRequest): Observable<OnlineResponse> {
    const url = `${environment.DEVSERVERAPI_URL}/refreshLicenseOnline`;
    return this.http.post<OnlineResponse>(url, licenseRequest, httpOptions);
  }

  public createOfflineActivationRequest(licenseRequest: LicenseRequest): Observable<OfflineLicenseResponse> {
    const url = `${environment.DEVSERVERAPI_URL}/createOfflineActivationRequest`;
    return this.http.post<OfflineLicenseResponse>(url, licenseRequest, httpOptions);
  }

  public createOfflineRefreshRequest(licenseRequest: LicenseRequest): Observable<OfflineLicenseResponse> {
    const url = `${environment.DEVSERVERAPI_URL}/createOfflineRefreshRequest`;
    return this.http.post<OfflineLicenseResponse>(url, licenseRequest, httpOptions);
  }

  public applyOfflineActivationResponse(licenseRequest: OfflineLicenseRequest): Observable<OfflineLicenseResponse> {
    const url = `${environment.DEVSERVERAPI_URL}/applyOfflineActivationResponse`;
    return this.http.post<OfflineLicenseResponse>(url, licenseRequest, httpOptions);
  }

  public applyOfflineRefreshResponse(licenseRequest: OfflineLicenseRequest): Observable<OfflineLicenseResponse> {
    const url = `${environment.DEVSERVERAPI_URL}/applyOfflineRefreshResponse`;
    return this.http.post<OfflineLicenseResponse>(url, licenseRequest, httpOptions);
  }

  public getNetworkLicenseInfo(): Observable<NetworkLicenseInfo> {
    console.log(`LicenseService getNetworkLicenseInfo`);
    return this.http.get<NetworkLicenseInfo>(
      `${environment.DEVSERVERAPI_URL}/networkLicenseInfo`, httpOptions);
  }

  public getNetworkLicenseSession(): Observable<NetworkLicenseSession> {
    console.log(`LicenseService getNetworkLicenseSession`);
    return this.http.get<NetworkLicenseSession>(
      `${environment.DEVSERVERAPI_URL}/networkLicenseSession`, httpOptions);
  }
}
