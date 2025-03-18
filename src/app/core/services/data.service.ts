// Copyright (c) 2023-2025 Triveni Digital, Inc. All rights reserved.

import {Injectable} from '@angular/core';
import {Observable, Subject} from 'rxjs';

// TODO This Service seems a bit odd, and will likely go away with further code refactoring.
//  Removed unused methods and down to just below.

@Injectable()
export class DataService {
  private subjectAllSession = new Subject<any>();
  private subjectSocketDataTitle = new Subject<any>();
  private subjectIsDirty = new Subject<any>();
  private subjectLicenseActivated = new Subject<any>();
  private subjectFeatureLicenseData = new Subject<any>();
  private subjectModalSchedProvOnConnectAddSchedData = new Subject<any>();

  constructor() {
  }

  public getDataAllSession(): Observable<any> {
    return this.subjectAllSession.asObservable();
  }

  public sendSocketDataTitle(message: string) {
    this.subjectSocketDataTitle.next(message);
  }

  public getIsDirty(): Observable<any> {
    return this.subjectIsDirty.asObservable();
  }

  public sendLicenseActivated(act: boolean) {
    this.subjectLicenseActivated.next(act);
  }

  public sendFeatureLicenseData(message: any) {
    this.subjectFeatureLicenseData.next(message);
  }

  public sendModalSchedProvOnConnectAddSchedData(message: any) {
    this.subjectModalSchedProvOnConnectAddSchedData.next(message);
  }
}
