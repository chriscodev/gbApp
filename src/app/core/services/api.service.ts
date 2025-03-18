// Copyright (c) 2024 Triveni Digital, Inc. All rights reserved.

import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {BehaviorSubject, Observable} from 'rxjs';

import {User} from '../models';
import {environment} from '../../../environments/environment';

// TODO This Service seems a bit odd, and will likely go away with further code refactoring.
//  Removed unused methods and down to just below.
@Injectable({providedIn: 'root'})
export class ApiService {
  public currentUserSubject: BehaviorSubject<User>;
  public currentUser: Observable<User>;

  constructor(private http: HttpClient) {
    this.currentUserSubject = new BehaviorSubject<User>(
      JSON.parse(localStorage?.getItem('currentUser'))
    );

    this.currentUser = this.currentUserSubject.asObservable();
  }

  public get currentUserValue(): User {
    return this.currentUserSubject.value;
  }

  public login(username, password) {
    const params = new HttpParams()
      ?.set('username', username)
      ?.set('password', password);
    const url = `${environment.LOGIN_URL}j_spring_security_check`;
    return this.http.post(url, params);
  }

  public logout() {
    localStorage?.clear();
    sessionStorage?.clear();
    this.currentUserSubject.next(null);
    const url = `${environment.LOGIN_URL}sessionExpired`;
    return this.http.get<any>(url);
  }

  public replaceWithSpecificAPIForWelcomeMessage() {
    const url = `${environment.LOGIN_URL}guideBuilder`;
    return this.http.get<any>(url);
  }
}
