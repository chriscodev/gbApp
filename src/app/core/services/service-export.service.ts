// Copyright (c) 2024 Triveni Digital, Inc. All rights reserved.

import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {environment} from '../../../environments/environment';
import {
  ExportProfile,
  ExportStatus,
  FTPTestRequest,
  FTPTestResponse,
  ServiceExportProfileUpdate
} from '../models/dtv/network/export/ExportProfile';


const httpOptions = {
  headers: new HttpHeaders({'Content-Type': 'application/json'}),
};

@Injectable({
  providedIn: 'root',
})
export class ServiceExportService {
  constructor(private http: HttpClient) {
  }

  public getExportProfiles(): Observable<ExportProfile[]> {
    return this.http.get<ExportProfile[]>(`${environment.DEVNETWORKURL}/serviceExportProfiles`, httpOptions);
  }

  public serviceExportProfileUpdate(serviceExportProfileUpdate: ServiceExportProfileUpdate,
                                    requestId: string): Observable<any> {
    const url =
      `${environment.DEVNETWORKURL}/serviceExportProfileUpdate?requestId=` +
      requestId;
    localStorage.setItem('lastCommitUpdateRequestId', requestId);
    return this.http.post<any>(url, serviceExportProfileUpdate);
  }

  public getAllExportStatus(): Observable<ExportStatus[]> {
    return this.http.get<ExportStatus[]>(`${environment.DEVNETWORKURL}/allExportServiceStatus`, httpOptions);
  }

  public exportProfileById(id: number) {
    const url = `${environment.DEVNETWORKURL}exportProfileById/` + id;
    return this.http.get<void>(url, httpOptions);
  }

  public doFtpTest(ftpTestRequest: FTPTestRequest): Observable<FTPTestResponse> {
    const url = `${environment.DEVNETWORKURL}serviceExportFtpTestConnection`;
    return this.http.put<FTPTestResponse>(url, ftpTestRequest, httpOptions);
  }

  public getServiceExportStatusById(id: number): Observable<ExportStatus> {
    return this.http.get<ExportStatus>(
      `${environment.DEVNETWORKURL}exportStatus/` + id
    );
  }

}
