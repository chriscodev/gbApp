/*
 * Copyright (c) 2023-2024 Triveni Digital, Inc. All rights reserved.
 */

import {Injectable} from '@angular/core';
import {AbstractMutableElementsClientModel} from './AbstractClientModel';
import {SnmpService} from '../services/snmp.service';
import {cloneDeep} from 'lodash';
import {SnmpManager, SnmpSettings, SNMPSettingsUpdate} from './snmp';
import {BehaviorSubject, Observable} from 'rxjs';
import {v4 as uuidv4} from 'uuid';
import {DefaultElementCompareHandler} from './DefaultElementCompareHandler';
import {RequestUpdateNotification, SockStompService} from '../services/sock-stomp.service';
import {StompVariables} from '../subscriptions/stompSubscriptions';

@Injectable({
  providedIn: 'root'
})
export class ClientSmnpModel extends AbstractMutableElementsClientModel {
  private static instanceCount = 0;
  public snmpSettingsSubject: BehaviorSubject<SnmpSettings> = new BehaviorSubject<SnmpSettings>(null);
  public snmpSettings$: Observable<SnmpSettings> = this.snmpSettingsSubject.asObservable();
  private snmpSettings: SnmpSettings;

  public constructor(private snmpService: SnmpService, private sockStompService: SockStompService) {
    super();
    console.log('ClientSmnpModel constructor snmpService: ', snmpService, ', instanceCount: ',
      ++ClientSmnpModel.instanceCount);
    this.sockStompService.addListener(this);
  }

  public getSnmpSettings(): SnmpSettings {
    return cloneDeep(this.snmpSettings);
  }

  public async refresh() {
    console.log('ClientSmnpModel refresh');
    this.doSnmpSettingsRefresh();
  }

  public async update(newSnmpSettings: SnmpSettings) {
    console.log('ClientSmnpModel update newSnmpSettings: ', newSnmpSettings);
    const elementCompareResults: DefaultElementCompareHandler<SnmpManager> = this.createElementsUpdate(
      this.snmpSettings.snmpManagers, newSnmpSettings.snmpManagers);
    const snmpSettingsUpdate: SNMPSettingsUpdate = new SNMPSettingsUpdate(newSnmpSettings.snmpConfiguration,
      elementCompareResults.added, elementCompareResults.updated, elementCompareResults.deletedIds);
    this.lastRequestId = uuidv4();
    this.snmpService.snmpSettingsUpdate(snmpSettingsUpdate, this.lastRequestId).subscribe(
      () => {
        this.refresh();
        console.log('ClientSmnpModel update refresh is called...');
      },
      (error) => {
        console.log('ClientSmnpModel update ERROR', error);
      }
    );
  }

  public notifyStompEvent(topic: string, messageJson: string) {
    if (topic === StompVariables.stompChannels.notifySNMPSettingsUpdate) {
      const requestUpdateNotification: RequestUpdateNotification = JSON.parse(messageJson);
      // Refresh if from other client and successful
      if (this.lastRequestId !== requestUpdateNotification.requestId &&
        requestUpdateNotification.success) {
        console.log('ClientSmnpModel refreshing from other client, notifyStompEvent: ', topic,
          ', requestUpdateNotification: ',
          requestUpdateNotification, ', this.lastRequestId: ', this.lastRequestId);
        this.refresh();
      }
    }
  }

  private doSnmpSettingsRefresh() {
    console.log('ClientSmnpModel doSnmpSettingsRefresh');
    this.snmpService.getSnmpSettings().subscribe(snmpSettings => {
      console.log('doSnmpSettingsRefresh snmpSettings', snmpSettings);
      this.snmpSettings = snmpSettings;
      const managers = snmpSettings.snmpManagers;
      console.log('managers', managers);
      this.snmpSettingsSubject.next(snmpSettings);
    });
  }
}
