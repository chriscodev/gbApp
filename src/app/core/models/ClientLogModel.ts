// Copyright (c) 2023-2024 Triveni Digital, Inc. All rights reserved.

import {AbstractClientModel} from './AbstractClientModel';
import {Injectable} from '@angular/core';
import {ActivityLogService} from '../services/activity-log.service';
import {BehaviorSubject, Observable} from 'rxjs';
import {isDefined} from './dtv/utils/Utils';
import {cloneDeep} from 'lodash';
import {EventLogMessage, RuntimeLog} from './server/EventLogMessage';
import {NotifyEventLogUpdate, SockStompService} from '../services/sock-stomp.service';
import {StompVariables} from '../subscriptions/stompSubscriptions';

@Injectable({
  providedIn: 'root'
})
export class ClientLogModel extends AbstractClientModel {
  public runTimeLogList: string[];
  public lastEventUpdatedId: number;
  public eventLogsSubject: BehaviorSubject<EventLogMessage[]> = new BehaviorSubject<EventLogMessage[]>([]);
  public eventLogs$: Observable<EventLogMessage[]> = this.eventLogsSubject.asObservable();
  public runtimeLogsSubject: BehaviorSubject<RuntimeLog[]> = new BehaviorSubject<RuntimeLog[]>([]);
  public runtimeLogs$: Observable<RuntimeLog[]> = this.runtimeLogsSubject.asObservable();

  public constructor(private activityLogService: ActivityLogService, private sockStompService: SockStompService) {
    super();
    console.log('ClientLogModel activityLogService: ', activityLogService);
    this.sockStompService.addListener(this);
  }

  public getRuntimeInfo(): string[] {
    return isDefined(this.runTimeLogList) ? cloneDeep(this.runTimeLogList) : undefined;
  }

  public async refresh() {
    this.doEventLogsRefresh();
    this.doRuntimeLogsRefresh();
  }

  public clearEventLogs(): void {
    this.activityLogService.getClearlogs();
  }

  getMaxId(): number {
    const currentLogs = this.eventLogsSubject.getValue();
    if (currentLogs.length === 0) {
      return 0;
    }
    return currentLogs.reduce((maxId, log) => log.id > maxId ? log.id : maxId, currentLogs[0].id);
  }

  public exportLogs(data): Observable<Blob> {
    return this.activityLogService.exportLogs(data);
  }

  public notifyStompEvent(topic: string, messageJson: string) {
    console.log('ClientLogsModel topic: ', topic, ', messageJson: ', messageJson);
    if (topic === StompVariables.stompChannels.notifyEventLogUpdate) {
      const notifyEventLogUpdate: NotifyEventLogUpdate = JSON.parse(messageJson);
      if (notifyEventLogUpdate.eventLogId > this.lastEventUpdatedId) {
        this.activityLogService.getEventLogById(this.lastEventUpdatedId).subscribe(
          (newEventLogs: EventLogMessage[]) => {
            this.updateEventLogs(newEventLogs);
          });
      }
    }
  }

  private doEventLogsRefresh(): void {
    this.activityLogService.getEventLogs().subscribe(eventLogs => {
      this.eventLogsSubject.next(eventLogs);
      this.lastEventUpdatedId = this.getMaxId();
      console.log('doActivityLogRefresh: ', eventLogs.length);
    });
  }

  private doRuntimeLogsRefresh(): void {
    const runtimeLogs: RuntimeLog[] = [];
    this.activityLogService.getRuntimeLogs().subscribe(runtimeLog => {
      runtimeLog.forEach(fileName => {
        const logObject: RuntimeLog = {fileName};
        runtimeLogs.push(logObject);
      });
      this.runtimeLogsSubject.next(runtimeLogs);
      console.log('doRuntimeLogRefresh: ', runtimeLog);
    });
  }

  private updateEventLogs(newLogs: EventLogMessage[]): void {
    const currentLogs = this.eventLogsSubject.getValue();
    const updatedLogs = currentLogs.concat(newLogs);
    this.eventLogsSubject.next(updatedLogs);
    this.lastEventUpdatedId = this.getMaxId();
    this.doEventLogsRefresh();
  }
}
