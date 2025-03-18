// Copyright (c) 2023-2024 Triveni Digital, Inc. All rights reserved.

import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {environment} from '../../../environments/environment';
import {Observable, Subject} from 'rxjs';
import {AbstractTransport, TransportsUpdate} from '../models/dtv/network/physical/Transport';
import {ImportCSVData} from '../models/dtv/transport/transportInterface';

const httpOptions = {
  headers: new HttpHeaders({'Content-Type': 'application/json'}),
};

@Injectable({
  providedIn: 'root',
})
export class TransportService {
  private subjectTransport = new Subject<any>();

  constructor(private http: HttpClient) {
  }

  public getTransports(): Observable<AbstractTransport[]> {
    return this.http.get<AbstractTransport[]>(`${environment.DEVNETWORKURL}transports?`, httpOptions);
  }

  public transportsUpdate(transportsUpdate: TransportsUpdate, requestId: string): Observable<TransportsUpdate> {
    const url = `${environment.DEVNETWORKURL}transportsUpdate?requestId=` +
      requestId;
    return this.http.post<any>(url, transportsUpdate, httpOptions);
  }

  public sendDataTransportCSV(ImportCSVData: ImportCSVData[]) {
    this.subjectTransport.next(ImportCSVData);
  }

  public clearDataTransport() {
    this.subjectTransport.next(null);
  }

  public getDataTransportCSV(): Observable<any> {
    return this.subjectTransport.asObservable();
  }
}
