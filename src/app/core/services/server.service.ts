// Copyright (c) 2023-2025 Triveni Digital, Inc. All rights reserved.

import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {environment} from '../../../environments/environment';
import {
  DebianPackage,
  FileNode,
  KeyValuePair,
  ResourceMap,
  RestartOptionsRequest,
  ServerInfo,
  ServerResourceType,
  ServerStatus,
  SoftwareVersionInfo
} from '../models/server/Server';
import {FileUploadService} from './file-upload.service';
import {ProgressBarDataInterface} from '../interfaces/ProgressBarDataInterface';

const httpOptions = {
  headers: new HttpHeaders({'Content-Type': 'application/json'}),
};

@Injectable({
  providedIn: 'root',
})
export class ServerService {
  public constructor(private http: HttpClient, private fileUploadService: FileUploadService) {
  }

  public getSoftwareVersionInfo(): Observable<SoftwareVersionInfo> {
    console.log(`LicenseService getSoftwareVersionInfo`);
    const url = `${environment.DEVSERVERAPI_URL}/softwareVersionInfo`;
    return this.http.get<SoftwareVersionInfo>(url, httpOptions);
  }

  public getServerInfo(): Observable<ServerInfo> {
    const url = `${environment.DEVSERVERAPI_URL}/serverInfo`;
    return this.http.get<ServerInfo>(url, httpOptions);
  }

  public getServerStatus(): Observable<ServerStatus> {
    const url = `${environment.DEVSERVERAPI_URL}/serverStatus`;
    return this.http.get<ServerStatus>(url, httpOptions);
  }

  public getResourceDirectoryListing(serverResourceType: ServerResourceType): Observable<ServerResourceType> {
    const url = `${environment.DEVSERVERAPI_URL}/resourceDirectoryListing/` + serverResourceType;
    return this.http.get<ServerResourceType>(url, httpOptions);
  }

  public getResourceDirectoryMap(): Observable<ResourceMap> {
    const url = `${environment.DEVSERVERAPI_URL}/resourceDirectoryMap`;
    const baseObservable = this.http.get<ResourceMap>(url);
    return new Observable<ResourceMap>((subscriber) => {
      baseObservable.subscribe({
        next: (value) => {
          const mapAsObject = JSON.parse(JSON.stringify(value));
          const serverResourceMap: ResourceMap = new Map(Object.entries(mapAsObject));
          serverResourceMap.forEach((fileNodes, key) => {
            if (fileNodes.length > 0) {
              const newFileNodes: FileNode[] = [];
              fileNodes.forEach(fileNode => {
                newFileNodes.push(
                  new FileNode(fileNode.id, fileNode.name, fileNode.downloadRelativePath, fileNode.lastModified,
                    fileNode.length));
              });
              serverResourceMap.set(key, newFileNodes);
            }
          });
          subscriber.next(serverResourceMap); // Example of modifying emitted values
        },
        error: (err) => {
          console.error('Wrapped Observable: Error', err);
          subscriber.error(err);
        },
        complete: () => {
          console.log('Wrapped Observable: Completed');
          subscriber.complete();
        },
      });
    });
  }

  public deleteMediaResources(resourceTypeRootDirectory: string, filename: string) {
    const url =
      `${environment.DEVSERVERAPI_URL}/resourceFile/` + resourceTypeRootDirectory + '/' + filename;
    return this.http.delete<any>(url);
  }

  public postResourceFile(resourceType: string, file: File) {
    const formData: FormData = new FormData();
    formData.append('resourceType', resourceType);
    formData.append('file', file);
    const url = `${environment.DEVSERVERAPI_URL}/resourceFile`;
    return this.http.post<any>(url, formData);
  }

  public serverShutdown() {
    const url = `${environment.SWAGGER_URL}/serverShutdown`;
    return this.http.post(url, httpOptions);
  }

  public getDebianPackages(): Observable<DebianPackage[]> {
    const url = `${environment.DEVSERVERAPI_URL}/debianPackages`;
    return this.http.get<DebianPackage[]>(url, httpOptions);
  }

  public postSoftwareUpdate(restartOptionsRequest: RestartOptionsRequest,
                            file: File): Observable<RestartOptionsRequest> {
    const formData: FormData = new FormData();
    formData?.append('json', JSON.stringify(restartOptionsRequest));
    formData?.append('file', file, file.name);
    const url = `${environment.DEVSERVERAPI_URL}/softwareUpdate`;
    const headers = new HttpHeaders();
    console.log('postSoftwareUpdate, file size: ', file.size, ', restartOptionsRequest: ', restartOptionsRequest);
    return this.http.post<RestartOptionsRequest>(url, formData, {headers});
  }

  public postSoftwareUpdateExperimental(restartOptionsRequest: RestartOptionsRequest,
                                        file: File): Observable<ProgressBarDataInterface> {
    const formData = new FormData();
    formData.append('json', JSON.stringify(restartOptionsRequest));
    formData.append('file', file, file.name);
    const method = 'POST';
    const url = `${environment.DEVSERVERAPI_URL}/softwareUpdate`;
    return this.fileUploadService.uploadFileTrackerWithRequest(formData, file.name, method, url);
  }

  public postRestoreDB(restartOptionsRequest: RestartOptionsRequest,
                       file: File): Observable<boolean> {
    const formData: FormData = new FormData();
    formData?.append('json', JSON.stringify(restartOptionsRequest));
    formData?.append('file', file, file.name);
    const url = `${environment.DEVSERVERAPI_URL}/restoreDB`;
    return this.http.post<any>(url, formData, httpOptions);
  }

  public postServerRestart(restartOptionsRequest: RestartOptionsRequest): Observable<RestartOptionsRequest> {
    const headers = new HttpHeaders();
    const url = `${environment.DEVSERVERAPI_URL}/serverRestart`;
    return this.http.post<RestartOptionsRequest>(url, restartOptionsRequest, {headers});
  }

  public postServerShutdown() {
    const url = `${environment.DEVSERVERAPI_URL}/serverShutdown`;
    return this.http.post<any>(url, null);
  }

  public getServerProps(): Observable<KeyValuePair[]> {
    const url = `${environment.DEVNETWORKURL}server/props`;
    return this.http.get<KeyValuePair[]>(url, httpOptions);
  }

  public setServerProps(props: KeyValuePair[]): Observable<KeyValuePair[]> {
    const headers = new HttpHeaders();
    const url = `${environment.DEVNETWORKURL}server/props`;
    return this.http.post<KeyValuePair[]>(url, props, {headers});
  }
}
