// Copyright (c) 2024-2025 Triveni Digital, Inc. All rights reserved.


import {Injectable} from '@angular/core';
import {AbstractMutableElementsClientModel} from './AbstractClientModel';
import {RedundancyService} from '../services/redundancy-service';
import {NotifyCommitUpdate, SockStompService} from '../services/sock-stomp.service';
import {RedundancySettings, RedundancyStatus} from './server/Redundancy';
import {BehaviorSubject, Observable} from 'rxjs';
import {v4 as uuidv4} from 'uuid';
import {StompVariables} from '../subscriptions/stompSubscriptions';
import {ServerService} from '../services/server.service';
import {swalErrorLogoutFunction} from '../../shared/helpers/appWideFunctions';
import {DefaultRestartOptionsRequest, RestartServerMode} from './server/Server';

@Injectable({
  providedIn: 'root'
})
export class ClientRedundancyModel extends AbstractMutableElementsClientModel {
  public redundancySettingsSubject: BehaviorSubject<RedundancySettings> = new BehaviorSubject<RedundancySettings>(null);
  public redundancySettings$: Observable<RedundancySettings> = this.redundancySettingsSubject.asObservable();

  public redundancyStatusSubject: BehaviorSubject<RedundancyStatus> = new BehaviorSubject<RedundancyStatus>(null);
  public redundancyStatus$: Observable<RedundancyStatus> = this.redundancyStatusSubject.asObservable();

  public constructor(private redundancyService: RedundancyService, private sockStompService: SockStompService,
                     private serverService: ServerService) {
    super();
    this.sockStompService.addListener(this);
  }

  public async refresh() {
    console.log('ClientRedundancyModel refresh');
    this.redundancyService.getRedundancySettings().subscribe(redundancySettings => {
      this.redundancySettingsSubject.next(redundancySettings);
      console.log('ClientRedundancyModel Settings:' + redundancySettings.gpiSetting);
      console.log('ClientRedundancyModel Settings port:' + redundancySettings.port);
      console.log('ClientRedundancyModel Settings scheme:' + redundancySettings.scheme);
    });

    this.redundancyService.getRedundancyStatus().subscribe(redundancyStatus => {
      this.redundancyStatusSubject.next(redundancyStatus);
      console.log('ClientRedundancyModel Status:' + redundancyStatus);
      console.log('ClientRedundancyModel Status redundancyState:' + redundancyStatus.redundancyState);
      console.log('ClientRedundancyModel Status redundancySystemState:' + redundancyStatus.redundancySystemState);
    });
  }

  public update(redundancySettings: RedundancySettings) {
    console.log('ClientRedundancyModel update redundancySettings: ', redundancySettings);
    this.lastRequestId = uuidv4();
    this.redundancyService.updateRedundancySettings(redundancySettings, this.lastRequestId).subscribe(
      () => {
        this.restartGuideBuilder(redundancySettings.target);
      },
      (error) => {
        console.log('ClientRedundancyModel update ERROR', error);
      }
    );
  }

  public restartGuideBuilder(target: RestartServerMode) {
    const messageAlert = 'The GuideBuilder Server is restarting';
    const restartOptionsRequest = new DefaultRestartOptionsRequest();
    restartOptionsRequest.restartServerMode = target;
    const observable: Observable<any> = this.serverService.postServerRestart(restartOptionsRequest);
    const observer = {
      next: () => {
        swalErrorLogoutFunction(messageAlert);
      },
      error: (error: any) => {
        // Handle error
        swalErrorLogoutFunction(error);
      },
      complete: () => {
        // Handle complete
        console.log('Observable complete onSubmitShutdown');
      }
    };
    // observable.subscribe(observer);
  }

  public notifyStompEvent(topic: string, messageJson: string) {
    console.log('ClientRedundancyModel topic: ', topic, ', messageJson: ', messageJson);
    // this is getting the /topic/notifyEventLogUpdated
    if (topic === StompVariables.stompChannels.notifyRedundancySettingsUpdate) {
      const notifyCommitUpdate: NotifyCommitUpdate = JSON.parse(messageJson);
      const lastRedundancySettingsRequestId: string = localStorage.getItem('lastRedundancySettingsRequestId');
      // Refresh from other client
      if (lastRedundancySettingsRequestId !== notifyCommitUpdate.requestId) {
        console.log('ClientRedundancyModel refreshing from other client, notifyStompEvent: ', topic,
          ', notifyCommitUpdate: ', notifyCommitUpdate, ', lastRedundancySettingsRequestId: ',
          lastRedundancySettingsRequestId);
        this.refresh();
      } else {
        console.log('ClientRedundancyModel ignoring notifyStompEvent: ', topic,
          ', notifyCommitUpdate: ', notifyCommitUpdate, ', lastRedundancySettingsRequestId: ',
          lastRedundancySettingsRequestId);
      }
    }
    // temporary trigger since this is not triggering notifyRedundancySettingsUpdate
    if (topic === StompVariables.stompChannels.notifyEventLogUpdate) {
      console.log('notifyStompEvent REDUNDANT');
      this.refresh();
    }
  }
}
