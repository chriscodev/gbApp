// Copyright (c) 2023-2024 Triveni Digital, Inc. All rights reserved.

import {AbstractClientModel} from './AbstractClientModel';
import {ALARM_TYPES, AlarmConfiguration, AlarmEvent} from './server/Alarm';
import {Injectable} from '@angular/core';
import {AlarmService} from '../services/alarm.service';
import {cloneDeep} from 'lodash';
import {BehaviorSubject, Observable} from 'rxjs';
import {v4 as uuidv4} from 'uuid';
import {NotifyAlarmEventUpdate, RequestUpdateNotification, SockStompService} from '../services/sock-stomp.service';
import {StompVariables} from '../subscriptions/stompSubscriptions';

@Injectable({
  providedIn: 'root'
})
export class ClientAlarmModel extends AbstractClientModel {
  private static instanceCount = 0;

  public activeAlarmsSubject: BehaviorSubject<AlarmEvent[]> = new BehaviorSubject<AlarmEvent[]>([]);
  public activeAlarms$: Observable<AlarmEvent[]> = this.activeAlarmsSubject.asObservable();
  public alarmHistorySubject: BehaviorSubject<AlarmEvent[]> = new BehaviorSubject<AlarmEvent[]>([]);
  public alarmHistory$: Observable<AlarmEvent[]> = this.alarmHistorySubject.asObservable();
  public alarmConfigurationsSubject: BehaviorSubject<AlarmConfiguration[]> = new BehaviorSubject<AlarmConfiguration[]>(
    []);
  public alarmConfigurations$: Observable<AlarmConfiguration[]> = this.alarmConfigurationsSubject.asObservable();

  public constructor(private alarmService: AlarmService, private sockStompService: SockStompService) {
    super();
    console.log('ClientAlarmModel constructor alarmService: ', alarmService, ', instanceCount: ',
      ++ClientAlarmModel.instanceCount);
    this.sockStompService.addListener(this);
  }

  public refresh() {
    this.doAlarmTypesRefresh();
    this.doActiveAlarmsRefresh();
    this.doAlarmConfigRefresh();
    this.doHistoryRefresh();
  }

  public update(newAlarmConfigurations: AlarmConfiguration[]): void {
    this.lastRequestId = uuidv4();
    this.alarmService.updateAlarmConfig(newAlarmConfigurations, this.lastRequestId).subscribe(
      () => {
        this.refresh();
      },
      (error) => {
        console.log('ClientAlarmModel update ERROR', error);
      }
    );
  }

  public notifyStompEvent(topic: string, messageJson: string) {
    if (topic === StompVariables.stompChannels.notifyAlarmConfigUpdate) {
      const requestUpdateNotification: RequestUpdateNotification = JSON.parse(messageJson);
      // Refresh if from other client and successful
      if (this.lastRequestId !== requestUpdateNotification.requestId && requestUpdateNotification.success) {
        console.log('ClientAlarmModel refreshing from other client, notifyStompEvent: ', topic,
          ', requestUpdateNotification: ', requestUpdateNotification, ', this.lastRequestId: ',
          this.lastRequestId);
        this.doAlarmConfigRefresh();
      }
    } else if (topic === StompVariables.stompChannels.notifyAlarmEventUpdate) {
      const notifyAlarmEventUpdate: NotifyAlarmEventUpdate = JSON.parse(messageJson);
      console.log('ClientAlarmModel refreshing from other client, notifyAlarmEventUpdate: ', topic, ',' +
        ' notifyAlarmEventUpdate: ', notifyAlarmEventUpdate);
      this.doActiveAlarmsRefresh();
      this.doHistoryRefresh();
    }
  }

  public getAlarmConfigurations(): AlarmConfiguration[] {
    return cloneDeep(Array.from(this.alarmConfigurationsSubject.getValue()));
  }

  public getActiveAlarms(): AlarmEvent[] {
    return cloneDeep(Array.from(this.activeAlarmsSubject.getValue()));
  }

  public doHistoryRefresh(): void {
    this.alarmService.getAlarmHistory().subscribe((alarmHistory) => {
      this.alarmHistorySubject.next(alarmHistory);
    });
  }

  public resetAlarmConfigToDefaults(): void {
    console.log('ClientAlarmModel resetAlarmConfigToDefaults');
    this.alarmService.resetAlarmConfigToDefaults().subscribe(() => {
      console.log('ClientAlarmModel resetAlarmConfigToDefaults refreshing');
      this.refresh();
    });
  }

  public clearAlarmHistory(): void {
    console.log('ClientAlarmModel clearAlarmHistory');
    this.alarmService.clearAlarmHistory().subscribe(() => {
      console.log('ClientAlarmModel clearAlarmHistory refreshing');
      this.refresh();
    });
  }

  private doAlarmConfigRefresh(): void {
    this.alarmService.getAlarmConfiguration().subscribe((alarmConfigurations: AlarmConfiguration[]) => {
      console.log('doAlarmConfigRefresh alarmConfigurations: ', alarmConfigurations);
      this.alarmConfigurationsSubject.next(alarmConfigurations);
    });
  }

  private doAlarmTypesRefresh(): void {
    this.alarmService.getAlarmTypes().subscribe(alarmTypes => {
      ALARM_TYPES.length = 0;
      alarmTypes?.forEach(alarmType => {
        ALARM_TYPES.push(
          {
            alarmType: alarmType.alarmType, displayName: alarmType.displayName,
            defaultAlarmLevel: alarmType.defaultAlarmLevel, defaultEnabled: alarmType.defaultEnabled,
            defaultTimeOutSeconds: alarmType.defaultTimeOutSeconds,
            defaultSendEmailEnabled: alarmType.defaultSendEmailEnabled
          }
        );
      });
    });
  }

  private doActiveAlarmsRefresh(): void {
    this.alarmService.getActiveAlarms().subscribe((alarmActives) => {
      this.activeAlarmsSubject.next(alarmActives);
    });
  }
}
