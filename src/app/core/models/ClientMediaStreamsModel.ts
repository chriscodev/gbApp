// Copyright (c) 2023-2024 Triveni Digital, Inc. All rights reserved.

import {Injectable} from '@angular/core';
import {AbstractDTVServiceClientModel} from './AbstractClientModel';
import {MediaStream, MediaStreamsUpdate} from './dtv/network/physical/stream/ip/media/MediaStream';
import {MediaStreamService} from '../services/media-stream.service';
import {DefaultElementCompareHandler} from './DefaultElementCompareHandler';
import {v4 as uuidv4} from 'uuid';
import {isDefined} from './dtv/utils/Utils';
import {cloneDeep} from 'lodash';
import {AbstractCommitUpdate} from './CommitUpdate';
import {BehaviorSubject, Observable} from 'rxjs';
import {StompVariables} from '../subscriptions/stompSubscriptions';
import {NotifyCommitUpdate, SockStompService} from '../services/sock-stomp.service';


@Injectable({
  providedIn: 'root'
})
export class ClientMediaStreamsModel extends AbstractDTVServiceClientModel {
  private static instanceCount = 0;
  public mediaStreamsSubject: BehaviorSubject<MediaStream[]> = new BehaviorSubject<MediaStream[]>([]);
  public mediaStreams$: Observable<MediaStream[]> = this.mediaStreamsSubject.asObservable();
  private mediaStreamMap: Map<number, MediaStream> = new Map<number, MediaStream>();

  public constructor(private mediaStreamService: MediaStreamService, private sockStompService: SockStompService
  ) {
    super();
    console.log('ClientMediaStreamsModel constructor mediaStreamService: ', mediaStreamService, ', instanceCount: ',
      ++ClientMediaStreamsModel.instanceCount);
    this.sockStompService.addListener(this);
  }

  public refresh() {
    this.mediaStreamService.getMediaStreams().subscribe(mediaStreams => {
      this.mediaStreamMap.clear();
      mediaStreams?.forEach(mediaStream => {
        this.mediaStreamMap.set(mediaStream.id, mediaStream);
      });
      this.mediaStreamsSubject.next(mediaStreams);
      console.log('mediaStreamMap length: ', this.mediaStreamMap.size);
    });
  }

  public createElementCommitUpdate(newMediaStreams: MediaStream[]): AbstractCommitUpdate<MediaStream> {
    const elementCompareResults: DefaultElementCompareHandler<MediaStream> = this.createElementsUpdate(
      this.getMediaStreams(), newMediaStreams);

    return new MediaStreamsUpdate(elementCompareResults.added, elementCompareResults.updated,
      elementCompareResults.deletedIds);
  }

  public async update(newMediaStreams: MediaStream[]): Promise<any> {
    console.log('ClientMediaStreamsModel update newMediaStreams: ', newMediaStreams);
    const mediaStreamsUpdate: MediaStreamsUpdate = this.createElementCommitUpdate(newMediaStreams);
    this.lastRequestId = uuidv4();
    await this.mediaStreamService.mediaStreamsUpdate(mediaStreamsUpdate, this.lastRequestId).subscribe(
      () => {
        this.refresh();
      },
      (error) => {
        console.log('ClientMediaStreamsModel update ERROR', error);
      }
    );
  }

  public getMediaStreams(): MediaStream[] {
    return cloneDeep(Array.from(this.mediaStreamMap.values()));
  }

  public getMediaStreamById(mediaStreamId: number): MediaStream {
    const dataPackage: MediaStream = this.mediaStreamMap.get(mediaStreamId);
    return isDefined(dataPackage) ? cloneDeep(dataPackage) : undefined;
  }

  public notifyStompEvent(topic: string, messageJson: string) {
    console.log('ClientMediaStreamsModel topic: ', topic, ', messageJson: ', messageJson);
    if (topic === StompVariables.stompChannels.notifyCommitUpdate) {
      const notifyCommitUpdate: NotifyCommitUpdate = JSON.parse(messageJson);
      const lastCommitUpdateRequestId: string = localStorage.getItem('lastCommitUpdateRequestId');
      // Refresh from other client
      if (lastCommitUpdateRequestId !== notifyCommitUpdate.requestId) {
        console.log('ClientMediaStreamsModel refreshing from other client, notifyStompEvent: ', topic,
          ', notifyCommitUpdate: ', notifyCommitUpdate, ', lastCommitUpdateRequestId: ', lastCommitUpdateRequestId);
        this.refresh();
      } else {
        console.log('ClientMediaStreamsModel ignoring notifyStompEvent: ', topic,
          ', notifyCommitUpdate: ', notifyCommitUpdate, ', lastCommitUpdateRequestId: ', lastCommitUpdateRequestId);
      }
    }
  }
}
