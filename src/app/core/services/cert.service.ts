// Copyright (c) 2023-2024 Triveni Digital, Inc. All rights reserved.

import {HttpClient, HttpEvent, HttpHeaders} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {environment} from '../../../environments/environment';
import {
  Cert,
  CertRequest,
  CertRequestsUpdate,
  CertStatus,
  CertsUpdate,
  CertTypeWithDisplayName,
  ExportKeyStoreDescriptor,
  KeyStoreDescriptor,
  KeyTypeWithDetails,
  OCSPStatusWithDisplayName
} from '../models/server/Cert';
import {FileUploadService} from './file-upload.service';
import {ProgressBarDataInterface} from '../interfaces/ProgressBarDataInterface';

type Long = number;

const httpOptions = {
  headers: new HttpHeaders({'Content-Type': 'application/json'}),
};

@Injectable({
  providedIn: 'root',
})
export class CertService {

  constructor(private http: HttpClient, private fileUploadService: FileUploadService) {
  }

  public getCertTypes(): Observable<CertTypeWithDisplayName[]> {
    return this.http.get<CertTypeWithDisplayName[]>(`${environment.DEVSERVERAPI_URL}/certTypes`, httpOptions);
  }

  public getOCSPStatuses(): Observable<OCSPStatusWithDisplayName[]> {
    return this.http.get<OCSPStatusWithDisplayName[]>(`${environment.DEVSERVERAPI_URL}/ocspStatuses`, httpOptions);
  }

  public getKeyTypes(): Observable<KeyTypeWithDetails[]> {
    return this.http.get<KeyTypeWithDetails[]>(`${environment.DEVSERVERAPI_URL}/keyTypes`, httpOptions);
  }

  public getCerts(): Observable<Cert[]> {
    return this.http.get<Cert[]>(`${environment.DEVSERVERAPI_URL}/certs`, httpOptions);
  }

  public getCertById(certId: number): Observable<Cert> {
    return this.http.get<Cert>(`${environment.DEVSERVERAPI_URL}/cert/` + certId, httpOptions);
  }

  public getCertStatusById(certId: number): Observable<CertStatus> {
    return this.http.get<CertStatus>(`${environment.DEVSERVERAPI_URL}/certStatus/` + certId, httpOptions);
  }

  public getCertStatusList(): Observable<CertStatus[]> {
    return this.http.get<CertStatus[]>(`${environment.DEVSERVERAPI_URL}/certStatusList/`, httpOptions);
  }

  public verifyCertById(certId: number) {
    const url = `${environment.DEVSERVERAPI_URL}/verifyCertById/` + certId;
    return this.http.get<any>(url, httpOptions);
  }

  public viewCert(certId: number): Observable<string> {
    const url = `${environment.DEVKEYSTOREAPI_URL}/decodeCert/` + certId;
    const headers = new HttpHeaders();
    return this.http.get(url, {headers, responseType: 'text'});
  }

  public certsUpdate(certsUpdate: CertsUpdate, requestId: string): Observable<CertsUpdate> {
    const url = `${environment.DEVSERVERAPI_URL}/certsUpdate?requestId=` + requestId;
    return this.http.post<CertsUpdate>(url, certsUpdate, httpOptions);
  }

  public certRequestsUpdate(certRequestsUpdate: CertRequestsUpdate,
                            requestId: string): Observable<CertRequestsUpdate> {
    const url = `${environment.DEVSERVERAPI_URL}/certRequestsUpdate?requestId=` + requestId;
    localStorage.setItem('lastCommitUpdateRequestId', requestId);
    return this.http.post<CertRequestsUpdate>(url, certRequestsUpdate, httpOptions);
  }

  public listKeyStores(file: File, json: KeyStoreDescriptor): Observable<ProgressBarDataInterface> {
    const url = `${environment.DEVKEYSTOREAPI_URL}/listEntries`;
    const formData: FormData = new FormData();
    const headers = new HttpHeaders();
    formData?.append('file', file, file.name);
    formData?.append('json', JSON.stringify(json));
    const method = 'POST';

    return this.fileUploadService.uploadFileTrackerWithRequest(formData, file.name, method, url);
  }

  public importCerts(file: File, json: KeyStoreDescriptor): Observable<ProgressBarDataInterface> {
    const url = `${environment.DEVKEYSTOREAPI_URL}/getEntries`;
    const formData: FormData = new FormData();
    const headers = new HttpHeaders();
    formData?.append('file', file, file.name);
    formData?.append('json', JSON.stringify(json));
    // return this.http.post<any>(url, formData, {headers});
    const method = 'POST';

    return this.fileUploadService.uploadFileTrackerWithRequest(formData, file.name, method, url);
  }

  public downloadExportFile(fileName: string): Observable<Blob> {
    const url = `${environment.ZIP_EXPORT_URL}/execute?command=getResourceFile&resourceType=databaseCustomArchive&fileName=` + fileName;
    return this.http.get(url, {responseType: 'blob'});
  }

  public exportCerts(exportCertDescriptor: ExportKeyStoreDescriptor): Observable<HttpEvent<ArrayBuffer>> {
    const url = `${environment.DEVKEYSTOREAPI_URL}/exportEntries`;
    const formData: FormData = new FormData();
    const headers = new HttpHeaders();
    formData?.append('json', JSON.stringify(exportCertDescriptor));
    return this.http.post(url, formData,
      {headers, responseType: 'arraybuffer', reportProgress: true, observe: 'events'});
  }

  public getCertRequests() {
    const url = `${environment.DEVSERVERAPI_URL}/certRequests`;
    return this.http.get<CertRequest[]>(url);
  }

  public exportCertRequestKey(csrId: number, key: string): Observable<string> {
    const url = `${environment.DEVNETWORKURL}/auth/exportCSRKey?csrId=` + csrId;
    const headers = new HttpHeaders();
    return this.http.get(url, {headers, responseType: 'text'});
  }
  public printCert(cert: string) {
    const url = `${environment.DEVSERVERAPI_URL}/printCert`;
    const headers = new HttpHeaders();
    return this.http.post(url, cert, { headers, responseType: 'text'} );
  }
}

