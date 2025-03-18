// Copyright (c) 2023-2024 Triveni Digital, Inc. All rights reserved.

import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {environment} from '../../../environments/environment';
import {SLSDescriptor} from '../models/dtv/mediaStream/SLS/SLSDescriptor';
import {MediaStreamIngestDescriptor} from '../models/dtv/mediaStream/MediaStreamIngestDescriptor';
import {BitrateDescriptor} from '../models/dtv/mediaStream/BitrateDescriptor';
import {StreamLogEntry, StreamLogType} from '../models/dtv/StreamLogEntry';
import {
  MMTPMediaSegmentTransmitDescriptor,
  RouteMediaSegmentSegmentTransmitDescriptor,
  TransmitStatus
} from '../models/dtv/mediaStream/TransmitStatus';
import {isDefined} from '@datorama/akita';

const httpOptions = {
  headers: new HttpHeaders({'Content-Type': 'application/json'}),
};

@Injectable({
  providedIn: 'root',
})
export class MediaStreamStatusService {
  constructor(private http: HttpClient) {
  }

  public getSLSDescriptor(streamId: number): Observable<SLSDescriptor> {
    return this.http.get<SLSDescriptor>(`${environment.DEVNETWORKURL}slsDescriptor/` + streamId, httpOptions);
  }

  public getMediaStreamIngestStatus(streamId: number): Observable<MediaStreamIngestDescriptor> {
    return this.http.get<MediaStreamIngestDescriptor>(`${environment.DEVNETWORKURL}mediaStreamIngestStatus/` + streamId,
      httpOptions);
  }

  public getMediaStreamTransmitStatus(streamId: number): Observable<TransmitStatus> {
    return this.http.get<TransmitStatus>(`${environment.DEVNETWORKURL}mediaStreamTransmitStatus/` + streamId,
      httpOptions);
  }

  public getAllBitratesStatus(): Observable<BitrateDescriptor> {
    return this.http.get<BitrateDescriptor>(`${environment.DEVNETWORKURL}ipStreamTotalBitrates`,
      httpOptions);
  }

  public getAllIPStreamLogs(greaterThanId?: number): Observable<StreamLogEntry> {
    return this.http.get<StreamLogEntry>(
      `${environment.DEVNETWORKURL}ipStreamLogs/` + isDefined(greaterThanId) ? '?greaterThanId=' + greaterThanId : '',
      httpOptions);
  }

  public getIPStreamLogs(streamId: number, streamLogType: StreamLogType,
                         greaterThanId?: number): Observable<StreamLogEntry> {
    const streamLogTypeAsInt: number = streamLogType === StreamLogType.MEDIA_STREAM ? 0 : 1;
    const greaterThanRequestParam: string = isDefined(greaterThanId) ? '&greaterThanId=' + greaterThanId : '';
    const queryParams: string = '?streamLogType=' + streamLogTypeAsInt + greaterThanRequestParam;
    return this.http.get<StreamLogEntry>(`${environment.DEVNETWORKURL}ipStreamLogs/` + streamId + queryParams,
      httpOptions);
  }

  public getMediaStreamLogs(greaterThanId?: number): Observable<StreamLogEntry> {
    return this.http.get<StreamLogEntry>(
      `${environment.DEVNETWORKURL}mediaStreamLogs/` + isDefined(
        greaterThanId) ? '?greaterThanId=' + greaterThanId : '',
      httpOptions);
  }

  public getRouteStreamTransmitStatus(streamId: number): Observable<RouteMediaSegmentSegmentTransmitDescriptor> {
    return this.http.get<RouteMediaSegmentSegmentTransmitDescriptor>(
      `${environment.DEVNETWORKURL}routeStreamTransmitStatus/` + streamId,
      httpOptions);
  }

  public getMmtpStreamTransmitStatus(streamId: number): Observable<MMTPMediaSegmentTransmitDescriptor> {
    return this.http.get<MMTPMediaSegmentTransmitDescriptor>(
      `${environment.DEVNETWORKURL}mmtpStreamTransmitStatus/` + streamId,
      httpOptions);
  }
}
