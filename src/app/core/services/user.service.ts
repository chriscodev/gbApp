// Copyright (c) 2023-2024 Triveni Digital, Inc. All rights reserved.

import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../environments/environment';
import {Observable} from 'rxjs';
import {User, UsersUpdate} from '../models/server/User';

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  constructor(
    private http: HttpClient,
  ) {
  }

  public getUsers() {
    const url = `${environment.DEVSERVERAPI_URL}/users`;
    return this.http.get<User[]>(url);
  }

  public usersUpdate(usersUpdate: UsersUpdate, requestId: string): Observable<any> {
    const url =
      `${environment.DEVSERVERAPI_URL}/usersAtomicUpdate?requestId=` +
      requestId;
    localStorage.setItem('lastCommitUpdateRequestId', requestId);
    return this.http.post<any>(url, usersUpdate);
  }
}
