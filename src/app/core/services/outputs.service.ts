// Copyright (c) 2023-2024 Triveni Digital, Inc. All rights reserved.

import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {environment} from '../../../environments/environment';
import {Observable, Subject} from 'rxjs';
import {
  AbstractOutput,
  OutputsUpdate,
  OutputTestRequest,
  OutputTestResponse,
  TableDomainWithDisplayName,
} from '../models/dtv/output/Output';
import {OutputStatus} from '../models/dtv/output/OutputStatus';
import {ElementIds} from '../models/AbstractElement';

const httpOptions = {
  headers: new HttpHeaders({'Content-Type': 'application/json'}),
};

@Injectable({
  providedIn: 'root',
})
export class OutputsService {
  private subjectOutputUdpRoute = new Subject<any>();

  public constructor(private http: HttpClient) {
  }

  public getTableDomains(): Observable<TableDomainWithDisplayName[]> {
    return this.http.get<TableDomainWithDisplayName[]>(
      `${environment.DEVNETWORKURL}tableDomains`
    );
  }

  public getOutputs(): Observable<AbstractOutput[]> {
    return this.http.get<AbstractOutput[]>(
      `${environment.DEVNETWORKURL}outputs`, httpOptions
    );
  }

  public getOutputStatusById(id: number): Observable<OutputStatus> {
    return this.http.get<OutputStatus>(
      `${environment.DEVNETWORKURL}outputStatus/` + id
    );
  }

  public getAllOutputStatus(): Observable<OutputStatus[]> {
    return this.http.get<OutputStatus[]>(
      `${environment.DEVNETWORKURL}allOutputsStatus`
    );
  }

  public postTestOutputConnection(outputTestRequest: OutputTestRequest): Observable<OutputTestResponse> {
    const url = `${environment.DEVNETWORKURL}testOutputConnection`;
    return this.http.post<OutputTestResponse>(url, outputTestRequest);
  }

  public outputsUpdate(outputsUpdate: OutputsUpdate, requestId: string): Observable<OutputsUpdate> {
    const url = `${environment.DEVNETWORKURL}outputsUpdate?requestId=` + requestId;
    return this.http.post<any>(url, outputsUpdate);
  }

  public encodeOutputs(outputIds: ElementIds): Observable<OutputsUpdate> {
    const url = `${environment.DEVNETWORKURL}encodeOutputs`;
    return this.http.put<any>(url, outputIds);
  }

  public sendDataOutputUdpRouteCSV(message: any) {
    this.subjectOutputUdpRoute.next(message);
  }

  public clearDataOutputUdpRoute() {
    this.subjectOutputUdpRoute.next(null);
  }

  public getDataOutputUdpRouteCSV(): Observable<any> {
    return this.subjectOutputUdpRoute.asObservable();
  }


  public getTransportTable(outputId: number, transportId: number, tableName: string): Observable<any> {
    const url = `${environment.DEVNETWORKURL}/transportTable/${outputId}/${transportId}/${tableName}`;
    return this.http.get<any>(url);
  }
}
