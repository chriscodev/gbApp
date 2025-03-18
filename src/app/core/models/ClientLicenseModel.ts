// Copyright (c) 2023-2024 Triveni Digital, Inc. All rights reserved.

import {AbstractClientModel} from './AbstractClientModel';
import {Injectable} from '@angular/core';
import {LicenseService} from '../services/license.service';
import {ServerLicenseInfo} from './server/License';
import {isDefined} from './dtv/utils/Utils';
import {cloneDeep} from 'lodash';
import {BehaviorSubject, Observable} from 'rxjs';
import {StompVariables} from '../subscriptions/stompSubscriptions';
import {SockStompService} from '../services/sock-stomp.service';

@Injectable({
  providedIn: 'root'
})
export class ClientLicenseModel extends AbstractClientModel {
  public serverLicenseInfoSubject: BehaviorSubject<ServerLicenseInfo> = new BehaviorSubject<ServerLicenseInfo>(
    undefined);
  public serverLicenseInfo$: Observable<ServerLicenseInfo> = this.serverLicenseInfoSubject.asObservable();
  private serverLicenseInfo: ServerLicenseInfo;

  public constructor(private sockStompService: SockStompService, private licenseService: LicenseService) {
    super();
    console.log('ClientLicenseModel licenseService: ', licenseService);
    this.sockStompService.addListener(this);
  }

  public getServerLicenseInfo(): ServerLicenseInfo {
    return isDefined(this.serverLicenseInfo) ? cloneDeep(this.serverLicenseInfo) : undefined;
  }

  public refresh() {
    this.doServerLicenseInfoRefresh();
  }

  public notifyStompEvent(topic: string, messageJson: string) {
    console.log('ClientLicenseModel received topic: ', topic, ', messageJson: ', messageJson);
    if (topic === StompVariables.stompChannels.notifyLicenseNodeLockChanged) {
      console.log('ClientLicenseModel received notifyLicenseNodeLockChanged, refreshing...');
      this.refresh();
    }
  }

  private doServerLicenseInfoRefresh(): void {
    this.licenseService.getServerLicenseInfo().subscribe(serverLicenseInfo => {
      this.serverLicenseInfo = serverLicenseInfo;
      // Hack to change to redundant
      // this.serverLicenseInfo.serverLicense.systemType = SystemType.REDUNDANT;
      console.log('doServerLicenseInfoRefresh this.serverLicenseInfo', this.serverLicenseInfo);
      this.serverLicenseInfoSubject.next(this.serverLicenseInfo);
    });
  }
}
