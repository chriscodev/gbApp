// Copyright (c) 2023-2024 Triveni Digital, Inc. All rights reserved.

import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {GetloginSession} from '../models';
import {environment} from '../../../environments/environment';
import {Observable} from 'rxjs';

const httpOptions = {
  headers: new HttpHeaders({'Content-Type': 'application/json'}),
};

@Injectable({providedIn: 'root'})
export class MainService {
  constructor(private http: HttpClient) {
  }

  public playPing() {
    const url = `${environment.GBWEBAPP_URL}/ping`;
    return this.http.get<any>(url);
  }

  public getLogSessions(): Observable<GetloginSession> {
    const url = `${environment.GBWEBAPP_URL}/loginSession`;
    return this.http.get<any>(url);
  }

  public getAllSessions(): Observable<GetloginSession> {
    return this.http.get<GetloginSession>(`${environment.GBWEBAPP_URL}/allLoginSessions`, httpOptions);
  }
}
