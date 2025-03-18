/*
 * Copyright (c) 2023-2024 Triveni Digital, Inc. All rights reserved.
 */

import {Injectable} from '@angular/core';
import {AbstractMutableElementsClientModel} from './AbstractClientModel';
import {cloneDeep} from 'lodash';
import {BehaviorSubject, Observable} from 'rxjs';
import {v4 as uuidv4} from 'uuid';
import {RequestUpdateNotification, SockStompService} from '../services/sock-stomp.service';
import {StompVariables} from '../subscriptions/stompSubscriptions';
import {SmtpEmailService} from '../services/smtp-email.services';
import {SmtpSettings} from './smtpEmail';

@Injectable({
  providedIn: 'root'
})
export class ClientSmtpModel extends AbstractMutableElementsClientModel {
  private static instanceCount = 0;

  public smtpEmailSubject: BehaviorSubject<SmtpSettings> = new BehaviorSubject<SmtpSettings>(null);
  public smtpEmail$: Observable<SmtpSettings> = this.smtpEmailSubject.asObservable();
  private smtpSettings: SmtpSettings;

  public constructor(
    private smtpService: SmtpEmailService,
    private sockStompService: SockStompService) {
    super();
    console.log('ClientSmtpModel constructor smtpService: ', smtpService, ', instanceCount: ',
      ++ClientSmtpModel.instanceCount);
    this.sockStompService.addListener(this);
  }

  public getSmtpSettings(): SmtpSettings {
    return cloneDeep(this.smtpSettings);
  }

  public async refresh() {
    console.log('ClientSmtpModel refresh');
    this.doSmtpEmailRefresh();
  }

  public async update(newSmtpSettings: SmtpSettings) {
    console.log('ClientSmtpModel update newSmtpSettings: ', newSmtpSettings);
    this.lastRequestId = uuidv4();
    this.smtpService.smtpSettingsUpdate(newSmtpSettings, this.lastRequestId).subscribe(
      () => {
        this.refresh();
        console.log('ClientSmtpModel update refresh is called...');
      },
      (error) => {
        console.log('ClientSmtpModel update ERROR', error);
      }
    );
  }

  public notifyStompEvent(topic: string, messageJson: string) {
    if (topic === StompVariables.stompChannels.notifySMTPSettingsUpdate) {
      const requestUpdateNotification: RequestUpdateNotification = JSON.parse(messageJson);
      // Refresh if from other client and successful
      if (this.lastRequestId !== requestUpdateNotification.requestId &&
        requestUpdateNotification.success) {
        console.log('ClientSmtpModel refreshing from other client, notifyStompEvent: ', topic,
          ', requestUpdateNotification: ',
          requestUpdateNotification, ', this.lastRequestId: ', this.lastRequestId);
        this.refresh();
      }
    }
  }

  private doSmtpEmailRefresh() {
    console.log('ClientSmtpModel doSmtpEmailRefresh');
    this.smtpService.getSmtpSettings().subscribe(smtpSettings => {
      console.log('doSmtpEmailRefresh smtpSettings: ', smtpSettings);
      this.smtpSettings = smtpSettings;
      this.smtpEmailSubject.next(smtpSettings);
    });
  }
}
