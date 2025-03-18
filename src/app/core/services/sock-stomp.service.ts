// Copyright (c) 2023-2024 Triveni Digital, Inc. All rights reserved.

import {Injectable} from '@angular/core';
import {StompVariables} from '../subscriptions/stompSubscriptions';
import {environment} from '../../../environments/environment';
import {isDefined} from '../models/dtv/utils/Utils';
import {CertStatus} from '../models/server/Cert';

declare var SockJS: any;
declare var Stomp: any;

// TODO use lib/stomp.js so can use types Client and Frame instead of any

@Injectable({
  providedIn: 'root',
})
export class SockStompService {
  private stompEventListeners: StompEventListener[] = [];
  private stompClient: any;

  constructor() {
    console.log('SockStompService constructor');
  }

  public initializeConnection(): void {
    this.initializeWebSocketConnection();
    console.log('SockStompService initializeConnection this: ', this);
  }

  public terminateConnection(): void {
    this.disconnect();
    console.log('SockStompService terminateConnection this.stompClient: ', this.stompClient);
  }

  public addListener(stompEventListener: StompEventListener): void {
    this.stompEventListeners.push(stompEventListener);
    console.log('<SockStompService addListener this.stompEventListeners size: ',
      this.stompEventListeners.length);
  }

  public removeListener(stompEventListener: StompEventListener): void {
    console.log('>SockStompService removeListener this.stompEventListeners size: ',
      this.stompEventListeners.length);
    this.stompEventListeners = this.stompEventListeners.filter(
      listener => listener !== stompEventListener);
    console.log('<SockStompService removeListener this.stompEventListeners size: ',
      this.stompEventListeners.length);
  }

  private initializeWebSocketConnection(): void {
    const serverUrl = environment.STOMP_URL;
    const ws = new SockJS(serverUrl);
    const stompChannel = StompVariables.stompChannels;
    this.stompClient = Stomp.over(ws);
    console.log('SockStompService initializeWebSocketConnection this: ', this);
    console.log('SockStompService serverUrl', serverUrl);
    console.log('SockStompService ws', ws);
    // console.log('data.stompChannel',data.stompChannel);
    // Note: comment out below to see stompClient debug messages for message traffic
    // data.stompClient.debug = undefined;
    // data.stompClient.debug = null;

    if (this.stompClient === undefined) {
      console.log(`SockStompService: No websocket connection can be made`);
      return;
    }
    this.stompClient.connect({}, (frame) => {
      this.stompClient.reconnect_delay = 2000;
      try {
        console.log('============WS Connected===============');
        this.subscribeTopic(stompChannel.loginSessionsUpdate);
        this.subscribeTopic(stompChannel.notifyUsersUpdate);
        this.subscribeTopic(stompChannel.notifySMTPSettingsUpdate);
        this.subscribeTopic(stompChannel.notifySNMPSettingsUpdate);
        this.subscribeTopic(stompChannel.notifyScheduleProvidersUpdate);
        this.subscribeTopic(stompChannel.notifyScheduleProviderStatusUpdate);
        this.subscribeTopic(stompChannel.notifyOutputStatusUpdate);
        this.subscribeTopic(stompChannel.notifyJavaAdminClientLogon);
        this.subscribeTopic(stompChannel.notifyLicenseNodeLockChanged);
        this.subscribeTopic(stompChannel.notifyLicenseLogoff);
        this.subscribeTopic(stompChannel.notifyCommitUpdate);
        this.subscribeTopic(stompChannel.notifyCertsUpdate);
        this.subscribeTopic(stompChannel.notifyEventLogUpdate);
        this.subscribeTopic(stompChannel.notifyCertStatusUpdate);
        this.subscribeTopic(stompChannel.notifyCertRequestsUpdate);
        this.subscribeTopic(stompChannel.notifyAlarmConfigUpdate);
        this.subscribeTopic(stompChannel.notifyAlarmEventUpdate);
        this.subscribeTopic(stompChannel.notifyServerStatusChanged);
        this.subscribeTopic(stompChannel.notifyLocationSettingsUpdate);
        this.subscribeTopic(stompChannel.notifyRedundancySettingsUpdate);
        this.subscribeTopic(stompChannel.notifyExportStatus);

        // Below is handy for debug. Traffic won't be sent unless topic is subscribed to.
        // this.subscribeTopic(stompChannel.notifyCurrentServerTime);

      } catch (error) {
        console.error('SockStompService stomp channel error: ', error);
      }
    });
  }

  private subscribeTopic(topic: string) {
    console.log('SockStompService subscribeTopic: ', topic);
    this.stompClient.subscribe(topic, (message) => {
      this.processStompMessage(topic, message);
    });
  }

  private processStompMessage(stompTopic, message) {
    const stompChannel = StompVariables.stompChannels;
    console.log('SockStompService processStompMessage stompTopic: ', stompTopic, ', message: ', message);
    if (stompTopic === stompChannel.notifyCurrentServerTime) {
      return;
    }
    this.stompEventListeners.forEach(
      stompEventListener => stompEventListener.notifyStompEvent(stompTopic, message.body));
  }

  private disconnect() {
    console.log('SockStompService disconnect, this.stompClient: ', this.stompClient);
    if (isDefined(this.stompClient)) {
      this.stompClient.disconnect();
      this.stompClient = undefined;
    }
    console.log('============WS Disconnected===============');
  }
}

export class RequestUpdateNotification {
  public constructor(public requestId: string, public success: boolean, public errorMessage: string) {
  }
}

export class NotifyCommitUpdate {
  public constructor(public requestId: string) {
  }
}

export class NotifyCertsUpdate {
  public constructor(public requestId: string) {
  }
}

export class NotifyCertStatusUpdate {
  public constructor(public certStatus: CertStatus) {
  }
}

export class NotifyEventLogUpdate {
  public constructor(public eventLogId: number) {
  }
}

export class NotifyAlarmEventUpdate {
  public constructor(public alarmEventId: number) {
  }
}

export class ElementStatusUpdate {
  public constructor(public id: number) {
  }
}

export interface StompEventListener {
  notifyStompEvent(topic: string, messageJson: string): void;
}
