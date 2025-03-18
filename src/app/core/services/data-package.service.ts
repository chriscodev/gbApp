// Copyright (c) 2023-2024 Triveni Digital, Inc. All rights reserved.

import {Injectable} from '@angular/core';
import {HttpClient, HttpEventType, HttpHeaders} from '@angular/common/http';
import {Observable} from 'rxjs';
import {environment} from '../../../environments/environment';
import {DataPackage, DataPackagesUpdate} from '../models/dtv/network/physical/stream/ip/data/DataPackage';
import {DataElement} from '../models/dtv/network/physical/stream/ip/data/element/DataElement';
import {ResolvedATSC3Transport} from '../models/dtv/network/physical/Transport';
import {map} from 'rxjs/operators';

const httpOptions = {
  headers: new HttpHeaders({'Content-Type': 'application/json'}),
};

@Injectable({
  providedIn: 'root',
})
export class DataPackageService {

  constructor(private http: HttpClient) {
  }

  public getDataPackages(): Observable<DataPackage[]> {
    return this.http.get<DataPackage[]>(`${environment.DEVNETWORKURL}dataPackages`, httpOptions);
  }

  public getDataPackageById(dataPackageId: number): Observable<DataPackage> {
    return this.http.get<DataPackage>(`${environment.DEVNETWORKURL}dataPackage/` + dataPackageId, httpOptions);
  }

  /**
   * Convenience call that has links resolved for {{ResolvedATSC3Service}} and {{DataPackage}}} arrays.
   */
  public getResolvedAtsc3Transports(): Observable<ResolvedATSC3Transport[]> {
    return this.http.get<ResolvedATSC3Transport[]>(`${environment.DEVNETWORKURL}atsc3Transports`, httpOptions);
  }

  public dataPackagesUpdate(dataPackagesUpdate: DataPackagesUpdate, requestId: string): Observable<DataPackagesUpdate> {
    const url = `${environment.DEVNETWORKURL}dataPackagesUpdate?requestId=` +
      requestId;
    return this.http.post<DataPackagesUpdate>(url, dataPackagesUpdate, httpOptions);
  }

  /**
   *  instant fetch for element like Get/AWS/
   */
  public updateDataElement(dataPackageId: number, elementId: number) {
    return this.http.get<DataElement>(
      `${environment.DEVNETWORKURL}dataElementChanged/` + dataPackageId + '/' + elementId, httpOptions);
  }

  /**
   *  instant fetch for element protocols like SIG(IEI)
   */
  public updateIEIDataElement(dataPackageId: number, elementId: number) {
    return this.http.get<DataElement>(
      `${environment.DEVNETWORKURL}fetchSIGDataElements/` + dataPackageId + '/' + elementId, httpOptions);
  }

  /**
   *  recreate the entire elements for managed IEI Data (SIG)
   */
  public recreateIEIDataElements(dataPackageId: number, elementId: number) {
    return this.http.get<DataElement>(
      `${environment.DEVNETWORKURL}recreateSIGDataElements/` + dataPackageId + '/' + elementId, httpOptions);
  }

  /**
   * upload File protocol File to server -NEED TO TEST
   */
  public dataPackageMedia(dataPackage: DataPackage, dataElement: DataElement, formData: FormData, requestID: string) {
    const headers = new HttpHeaders();
    headers.append('Content-Type', 'multipart/form-data');
    let path: string = `${environment.DEVNETWORKURL}dataPackageMedia/` + dataPackage.id + '/' + dataElement.id;
    path += '?requestId=' + requestID;
    if (dataElement.ingestAttributes.disableAutoExpandZip) {
      path += '&autoExpandZip=' + dataElement.ingestAttributes.disableAutoExpandZip;
    }
    if (dataElement.ingestAttributes.appendFile) {
      path += '&appendFiles=' + dataElement.ingestAttributes.appendFile;
    }
    if (dataElement.ingestAttributes.createMultipart) {
      path += '&createMultipart=' + dataElement.ingestAttributes.createMultipart;
    }
    console.log('path--' + path);
    return this.http
      .post(path, formData, {
        headers,
        reportProgress: true,
        observe: 'events',
      })
      .pipe(
        map((event) => {
          switch (event.type) {
            case HttpEventType.UploadProgress:
              const progress = Math.round((100 * event.loaded) / event.total);
              return {status: 'progress', message: progress};
            case HttpEventType.Response:
              return event.body;
            default:
              return `Unhandled event: ${event.type}`;
          }
        })
      );
  }
}

