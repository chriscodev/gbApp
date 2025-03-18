// Copyright (c) 2023-2024 Triveni Digital, Inc. All rights reserved.

import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Observable} from 'rxjs';
import {environment} from '../../../environments/environment';
import {DTVServiceCommitUpdate} from '../models/CommitUpdate';

const httpOptions = {
  headers: new HttpHeaders({'Content-Type': 'application/json'}),
};

// TODO Perhaps merge with other Service since only has one method.
@Injectable({
  providedIn: 'root',
})
export class DTVService {
  constructor(private http: HttpClient) {
  }

  public dtvServiceCommitUpdate(dtvServiceCommitUpdate: DTVServiceCommitUpdate,
                                requestId: string): Observable<DTVServiceCommitUpdate> {
    const url = `${environment.DEVNETWORKURL}dtvServiceCommitUpdate?requestId=` +
      requestId;
    localStorage.setItem('lastCommitUpdateRequestId', requestId);
    return this.http.post<DTVServiceCommitUpdate>(url, dtvServiceCommitUpdate, httpOptions);
  }
}
