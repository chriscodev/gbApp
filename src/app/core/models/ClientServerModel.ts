// Copyright (c) 2023-2025 Triveni Digital, Inc. All rights reserved.

import {Injectable} from '@angular/core';
import {AbstractClientModel} from './AbstractClientModel';
import {ServerService} from '../services/server.service';
import {DebianPackage, ServerInfo, ServerStatus, SoftwareVersionInfo} from './server/Server';
import {BehaviorSubject, Observable} from 'rxjs';
import {isDefined} from './dtv/utils/Utils';
import {cloneDeep} from 'lodash';
import {SockStompService} from '../services/sock-stomp.service';
import {StompVariables} from '../subscriptions/stompSubscriptions';
import {ServerLicenseInfo} from './server/License';

@Injectable({
  providedIn: 'root'
})
export class ClientServerModel extends AbstractClientModel {
  private static instanceCount = 0;
  public serverInfoSubject: BehaviorSubject<ServerInfo> = new BehaviorSubject<ServerInfo>(null);
  public serverInfo$: Observable<ServerInfo> = this.serverInfoSubject.asObservable();
  public serverStatusSubject: BehaviorSubject<ServerStatus> = new BehaviorSubject<ServerStatus>(null);
  public serverStatus$: Observable<ServerStatus> = this.serverStatusSubject.asObservable();
  public debianPackageInfo: DebianPackage[] = [];
  public softwareVersionInfoSubject: BehaviorSubject<SoftwareVersionInfo> = new BehaviorSubject<SoftwareVersionInfo>(null);
  public softwareVersionInfo$: Observable<SoftwareVersionInfo> = this.softwareVersionInfoSubject.asObservable();
  private softwareVersionInfo: SoftwareVersionInfo;

  public constructor(private serverService: ServerService, private sockStompService: SockStompService) {
    super();
    console.log('ClientServerModel constructor serverService: ', serverService, ', instanceCount: ',
      ++ClientServerModel.instanceCount);
    this.sockStompService.addListener(this);
  }

  public getServerSoftwareInfo(): SoftwareVersionInfo {
    return isDefined(this.softwareVersionInfo) ? cloneDeep(this.softwareVersionInfo) : undefined;
  }

  public refresh() {
    this.doServerSoftwareInfoRefresh();
    this.getServerInfo();
    this.getServerStatusInfo();
    this.doDebianInfoRefresh();
  }

  public notifyStompEvent(topic: string, messageJson: string) {
    if (topic === StompVariables.stompChannels.notifyServerStatusChanged) {
      console.log('ClientServerModel notifyServerStatusChanged stomp event, refreshing');
      this.refresh();
    }
  }

  public getASITransmitCardIds(): number[] {
    return this.serverStatusSubject.getValue()?.asiTransmitCardIds;
  }

  private doServerSoftwareInfoRefresh(): void {
    this.serverService.getSoftwareVersionInfo().subscribe(softwareVersionInfo => {
      this.softwareVersionInfo = softwareVersionInfo;
      this.softwareVersionInfoSubject.next(this.softwareVersionInfo);
    });
  }

  private getServerInfo(): void {
    this.serverService.getServerInfo().subscribe(serverStatusInfo => {
      this.serverInfoSubject.next(serverStatusInfo);
    });
  }

  private doDebianInfoRefresh(): void {
    this.serverService.getDebianPackages().subscribe(debianInfo => {
      this.debianPackageInfo = debianInfo;
    });
  }

  private getServerStatusInfo(): void {
    this.serverService.getServerStatus().subscribe(serverStatus => {
      this.serverStatusSubject.next(serverStatus);
    });
  }
}
