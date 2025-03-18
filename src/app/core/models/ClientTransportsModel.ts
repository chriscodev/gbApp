/*
 * Copyright (c) 2023-2024 Triveni Digital, Inc. All rights reserved.
 */

import {Injectable} from '@angular/core';
import {AbstractDTVServiceClientModel} from './AbstractClientModel';
import {
  AbstractTransport,
  ATSC3TranslatedTransport,
  ATSC3Transport,
  CablePSIPTransport,
  TerrestialPSIPTransport,
  TransportsUpdate,
  TransportType
} from './dtv/network/physical/Transport';
import {TransportService} from '../services/transport.service';
import {isDefined} from './dtv/utils/Utils';
import {cloneDeep} from 'lodash';
import {DefaultElementCompareHandler} from './DefaultElementCompareHandler';
import {v4 as uuidv4} from 'uuid';
import {AbstractCommitUpdate} from './CommitUpdate';
import {BehaviorSubject, Observable} from 'rxjs';
import {ClientMediaStreamsModel} from './ClientMediaStreamsModel';
import {MediaStream} from './dtv/network/physical/stream/ip/media/MediaStream';
import {StompVariables} from '../subscriptions/stompSubscriptions';
import {NotifyCommitUpdate, SockStompService} from '../services/sock-stomp.service';

@Injectable({
  providedIn: 'root'
})
export class ClientTransportsModel extends AbstractDTVServiceClientModel {
  private static instanceCount = 0;
  public transportsSubject: BehaviorSubject<AbstractTransport[]> = new BehaviorSubject<AbstractTransport[]>([]);
  public transports$: Observable<AbstractTransport[]> = this.transportsSubject.asObservable();
  private transportMap: Map<number, AbstractTransport> = new Map<number, AbstractTransport>();
  private initialized = false;

  public constructor(private transportService: TransportService,
                     private clientMediaStreamsModel: ClientMediaStreamsModel,
                     private sockStompService: SockStompService) {
    super();
    this.sockStompService.addListener(this);
    console.log('ClientTransportsModel constructor transportService: ', transportService, ', instanceCount: ',
      ++ClientTransportsModel.instanceCount);
    this.clientMediaStreamsModel.mediaStreams$.subscribe(
      (mediaStreams: MediaStream[]) => {
        if (this.initialized) {
          this.refresh();
        }
        this.initialized = true;
      });
  }

  public refresh(): void {
    console.log('ClientTransportsModel refresh');
    this.doTransportsRefresh();
  }

  public createElementCommitUpdate(newTransports: AbstractTransport[]): AbstractCommitUpdate<AbstractTransport> {
    const elementCompareResults: DefaultElementCompareHandler<AbstractTransport> = this.createElementsUpdate(
      this.getTransports(), newTransports);
    return new TransportsUpdate(elementCompareResults.added, elementCompareResults.updated,
      elementCompareResults.deletedIds);
  }

  public update(newTransports: AbstractTransport[]): void {
    console.log('ClientTransportsModel update newTransports: ', newTransports);
    const transportsUpdate: TransportsUpdate = this.createElementCommitUpdate(newTransports);
    this.lastRequestId = uuidv4();
    console.log('ClientTransportsModel update newTransports: ', newTransports);
    this.transportService.transportsUpdate(transportsUpdate, this.lastRequestId).subscribe(
      () => {
        // TODO notify Transport's updated?
      },
      (error) => {
        console.log('ClientTransportsModel update ERROR', error);
      }
    );
  }

  public getTransports(): AbstractTransport[] {
    return cloneDeep(Array.from(this.transportMap.values()));
  }

  public getTransportById(transportId: number): AbstractTransport {
    const transport: AbstractTransport = this.transportMap.get(transportId);
    return isDefined(transport) ? cloneDeep(transport) : undefined;
  }

  private addSupportedTransport(transport: AbstractTransport): void {
    switch (transport.transportType) {
      case TransportType.ATSC_PSIP_TERRESTRIAL:
        this.transportMap.set(transport.id, transport as TerrestialPSIPTransport);
        break;
      case TransportType.ATSC_PSIP_CABLE:
        this.transportMap.set(transport.id, transport as CablePSIPTransport);
        break;
      case TransportType.ATSC_3:
        this.transportMap.set(transport.id, transport as ATSC3Transport);
        break;
      case TransportType.ATSC_3_TRANSLATED:
        this.transportMap.set(transport.id, transport as ATSC3TranslatedTransport);
        break;
    }
    console.log('ClientTransportsModel addSupportedTransport transport.transportType: ', transport.transportType,
      ', transport: ',
      transport);
  }

  private doTransportsRefresh(): void {
    console.log('ClientTransportsModel doTransportsRefresh');
    this.transportService.getTransports().subscribe(transports => {
      this.transportMap.clear();
      transports?.forEach(transport => {
        this.addSupportedTransport(transport);
      });
      this.transportsSubject.next(transports);
      console.log('ClientTransportsModel transportMap length: ', this.transportMap.size);
    });
  }

  public notifyStompEvent(topic: string, messageJson: string) {
    console.log('ClientTransportModel topic: ', topic, ', messageJson: ', messageJson);
    if (topic === StompVariables.stompChannels.notifyCommitUpdate) {
      const notifyCommitUpdate: NotifyCommitUpdate = JSON.parse(messageJson);
      const lastCommitUpdateRequestId: string = localStorage.getItem('lastCommitUpdateRequestId');
      // Refresh from other client
      if (lastCommitUpdateRequestId !== notifyCommitUpdate.requestId) {
        console.log('ClientTransportModel refreshing from other client, notifyStompEvent: ', topic,
          ', notifyCommitUpdate: ', notifyCommitUpdate, ', lastCommitUpdateRequestId: ', lastCommitUpdateRequestId);
        this.refresh();
      } else {
        console.log('ClientTransportModel ignoring notifyStompEvent: ', topic,
          ', notifyCommitUpdate: ', notifyCommitUpdate, ', lastCommitUpdateRequestId: ', lastCommitUpdateRequestId);
      }
    }
  }
}
