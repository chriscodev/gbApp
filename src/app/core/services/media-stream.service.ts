// Copyright (c) 2023-2024 Triveni Digital, Inc. All rights reserved.

import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Observable} from 'rxjs';
import {environment} from '../../../environments/environment';
import {MediaStream, MediaStreamsUpdate} from '../models/dtv/network/physical/stream/ip/media/MediaStream';

const httpOptions = {
  headers: new HttpHeaders({'Content-Type': 'application/json'}),
};

@Injectable({
  providedIn: 'root',
})
export class MediaStreamService {
  constructor(private http: HttpClient) {
  }

  public getMediaStreams(): Observable<MediaStream[]> {
    return this.http.get<MediaStream[]>(`${environment.DEVNETWORKURL}mediaStreams`, httpOptions);
  }

  public mediaStreamsUpdate(mediaStreamsUpdate: MediaStreamsUpdate, requestId: string): Observable<MediaStreamsUpdate> {
    const url = `${environment.DEVNETWORKURL}mediaStreamsUpdate?requestId=` +
      requestId;
    return this.http.post<MediaStreamsUpdate>(url, mediaStreamsUpdate, httpOptions);
  }
}
