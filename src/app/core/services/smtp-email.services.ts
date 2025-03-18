// Copyright (c) 2024 Triveni Digital, Inc. All rights reserved.

import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {SmtpSettings, SmtpTestMessage} from 'src/app/core/models';
import {Observable} from 'rxjs';
import {environment} from '../../../environments/environment';

const httpOptions = {
  headers: new HttpHeaders({'Content-Type': 'application/json'}),
};

@Injectable({
  providedIn: 'root',
})
export class SmtpEmailService {
  constructor(private http: HttpClient) {
  }

  public getSmtpSettings(): Observable<SmtpSettings> {
    return this.http.get<SmtpSettings>(`${environment.DEVSERVERAPI_URL}/smtpSettings`, httpOptions);
  }

  public smtpSettingsUpdate(smtpSettings: SmtpSettings, requestId: string): Observable<SmtpSettings> {
    const url = `${environment.DEVSERVERAPI_URL}/updateSMTPSettings?requestId=` + requestId;
    localStorage.setItem('lastCommitUpdateRequestId', requestId);
    return this.http.post<SmtpSettings>(url, smtpSettings, httpOptions);
  }

  public postSendTestSmtpMessage(smtpTestMessage: SmtpTestMessage): Observable<SmtpTestMessage> {
    const url = `${environment.DEVSERVERAPI_URL}/sendTestSMTPMessage`;
    return this.http.post<any>(url, smtpTestMessage, httpOptions);
  }
}
