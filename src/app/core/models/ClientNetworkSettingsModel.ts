// Copyright (c) 2023-2024 Triveni Digital, Inc. All rights reserved.

import {AbstractClientModel} from './AbstractClientModel';
import {NetworkSettingsService} from '../services/network-settings.service';
import {NetworkSettings, NICDescriptor, UpdateNetworkSettings} from './server/NetworkSetting';
import {Injectable} from '@angular/core';
import {cloneDeep} from 'lodash';
import {isDefined} from './dtv/utils/Utils';
import {BehaviorSubject, Observable} from 'rxjs';
import {SockStompService} from '../services/sock-stomp.service';
import {StompVariables} from '../subscriptions/stompSubscriptions';
import {NICState} from './server/Server';

@Injectable({
  providedIn: 'root'
})
export class ClientNetworkSettingsModel extends AbstractClientModel {
  private static instanceCount = 0;
  public networkSettingsSubject: BehaviorSubject<NetworkSettings> = new BehaviorSubject<NetworkSettings>(null);
  public networkSettings$: Observable<NetworkSettings> = this.networkSettingsSubject.asObservable();
  public nicStateSubject: BehaviorSubject<Map<string, NICState>> = new BehaviorSubject<Map<string, NICState>>(null);
  public nicStateSubject$: Observable<Map<string, NICState>> = this.nicStateSubject.asObservable();
  private networkList: NICDescriptor[];
  private defaultTrafficNIC: string;

  public constructor(private networkSettingsService: NetworkSettingsService,
                     private sockStompService: SockStompService) {
    super();
    console.log('ClientNetworkSettingsModel constructor networkSettingsService: ', networkSettingsService,
      ', instanceCount: ',
      ++ClientNetworkSettingsModel.instanceCount);
    this.sockStompService.addListener(this);
  }

  public refresh() {
    console.log('ClientNetworkSettingsModel refresh');
    this.refreshNetworkList();
    this.refreshNetworkingSettings();
    this.refreshNICStates();
  }

  public async update(updateNetworkSettings: UpdateNetworkSettings): Promise<any> {
    await this.networkSettingsService.updateNetworkSettings(updateNetworkSettings).subscribe(
      () => {
        // if (!updateNetworkSettings.restartServer) {
        // check with Dave do we need this it doesn't load networking data on f5 refresh
        console.log('ClientNetworkSettingsModel update complete, refreshing...');
        this.refresh();
        // }
      });
  }

  public getNetworkList(): NICDescriptor[] {
    console.log('getNetworkList: ', this.networkList);
    return isDefined(this.networkList) ? cloneDeep(this.networkList) : undefined;
  }

  public getDefaultTrafficNICName(): string {
    return this.defaultTrafficNIC;
  }

  public notifyStompEvent(topic: string, messageJson: string) {
    console.log('ClientNetworkSettingsModel topic: ', topic, ', messageJson: ', messageJson);
    if (topic === StompVariables.stompChannels.notifyServerStatusChanged) {
      this.refreshNICStates();
      this.refreshNetworkingSettings();
    }
  }

  public getNICStates() {
    return this.networkSettingsService.getNICStates();
  }

  public refreshNICStates() {
    this.networkSettingsService.getNICStates().subscribe(nics => {
      this.nicStateSubject.next(nics);
      console.log('NIC states updated:', nics);
    });
  }

  public refreshNetworkList(): void {
    this.networkSettingsService.getNetworkList().subscribe(networkList => {
      this.networkList = networkList;
      this.defaultTrafficNIC = this.networkList?.length > 0 ? this.networkList[0].interfaceName : undefined;
      this.networkList.forEach(nic => {
        nic.verboseName = nic.interfaceName + ' (' + nic.ipaddress + ' - ' + nic.displayName + ')';
      });
      console.log('ClientNetworkSettingsModel networkList: ', networkList, ', defaultTrafficNIC: ',
        this.defaultTrafficNIC);
    });
  }

  private refreshNetworkingSettings(): void {
    this.networkSettingsService.getNetworkSettings().subscribe(networkSettings => {
      this.networkSettingsSubject.next(networkSettings);
      console.log('networkSettings: ', networkSettings);
    });
  }
}

