// Copyright (c) 2023-2024 Triveni Digital, Inc. All rights reserved.

import {Injectable} from '@angular/core';
import {HttpClient, HttpEvent, HttpHeaders} from '@angular/common/http';
import {environment} from '../../../environments/environment';
import {Observable} from 'rxjs';
import {LocationSettings} from '../models/server/LocationSettings';
import {RestartOptionsRequest} from '../models/server/Server';
import {ProgressBarDataInterface} from '../interfaces/ProgressBarDataInterface';
import {FileUploadService} from './file-upload.service';

const httpOptions = {
  headers: new HttpHeaders({'Content-Type': 'application/json'}),
};

@Injectable({providedIn: 'root'})
export class LocationSettingsService {
  constructor(private http: HttpClient, private fileUploadService: FileUploadService) {
  }

  public getLocationSettings(): Observable<LocationSettings> {
    const url = `${environment.DEVSERVERAPI_URL}/locationSettings`;
    return this.http.get<LocationSettings>(url);
  }

  public updateLocationSettings(locationSettingsUpdate: LocationSettings,
                                requestId: string): Observable<LocationSettings> {
    const url = `${environment.DEVSERVERAPI_URL}/updateLocationSettings?requestId=` +
      requestId;
    localStorage.setItem('lastCommitUpdateRequestId', requestId);
    return this.http.post<LocationSettings>(url, locationSettingsUpdate, httpOptions);
  }

  public createBackup(archiveMessage: string, fileName: string): Observable<boolean> {
    return this.http.get<boolean>(`${environment.DEVSERVERAPI_URL}/backupDownload?archMessage=` + archiveMessage +
      `&fileName=` + fileName, httpOptions);
  }

  public downloadBackupFile(fileName: string): Observable<HttpEvent<Blob>> {
    const url = `${environment.ZIP_EXPORT_URL}/execute?command=getResourceFile&resourceType=databaseCustomArchive&fileName=` + fileName;
    return this.http.get(url, {responseType: 'blob', reportProgress: true, observe: 'events'});
  }

  public doRestore(file: File, restartOptions: RestartOptionsRequest): Observable<ProgressBarDataInterface> {
    const formData = new FormData();
    formData.append('json', JSON.stringify(restartOptions));
    formData.append('file', file, file.name);
    const method = 'POST';
    const url = `${environment.DEVSERVERAPI_URL}/restoreDatabase`;
    const options = 'restart';
    return this.fileUploadService.uploadFileTrackerWithRequest(formData, file.name, method, url, options);
  }
}

