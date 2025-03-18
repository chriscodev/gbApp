// Copyright (c) 2023-2024 Triveni Digital, Inc. All rights reserved.

import {Injectable} from '@angular/core';
import {AbstractDTVServiceClientModel} from './AbstractClientModel';
import {NetworkService} from '../services/network.service';
import {
  AbstractNetwork,
  ATSC3Network,
  CableATSCNetwork,
  NetworksUpdate,
  NetworkType,
  TerrestrialATSCNetwork
} from './dtv/network/logical/Network';
import {isDefined} from './dtv/utils/Utils';
import {cloneDeep} from 'lodash';
import {DefaultElementCompareHandler} from './DefaultElementCompareHandler';
import {v4 as uuidv4} from 'uuid';
import {AbstractCommitUpdate} from './CommitUpdate';

import {BehaviorSubject, Observable} from 'rxjs';
import {StompVariables} from '../subscriptions/stompSubscriptions';
import {NotifyCommitUpdate, SockStompService} from '../services/sock-stomp.service';

@Injectable({
  providedIn: 'root'
})
export class ClientNetworksModel extends AbstractDTVServiceClientModel {
  private static instanceCount = 0;
  public networkList: BehaviorSubject<AbstractNetwork[]> = new BehaviorSubject<AbstractNetwork[]>([]);
  public networkList$: Observable<AbstractNetwork[]> = this.networkList.asObservable();
  private networkMap: Map<number, AbstractNetwork> = new Map<number, AbstractNetwork>();
  private serviceUuidMap: Map<number, string> = new Map<number, string>();

  public constructor(private networkService: NetworkService, private sockStompService: SockStompService) {
    super();
    this.sockStompService.addListener(this);
    console.log('ClientNetworksModel constructor networkService: ', networkService, ', instanceCount: ',
      ++ClientNetworksModel.instanceCount);
  }

  public refresh(): void {
    console.log('ClientNetworksModel refresh');
    this.doNetworksRefresh();
  }

  public getNetworks(): AbstractNetwork[] {
    return cloneDeep(Array.from(this.networkMap.values()));
  }

  public getServiceUuid(serviceId: number): string {
    return this.serviceUuidMap.get(serviceId);
  }

  public getTransportById(networkId: number): AbstractNetwork {
    const network: AbstractNetwork = this.networkMap.get(networkId);
    return isDefined(network) ? cloneDeep(network) : undefined;
  }

  public createElementCommitUpdate(newNetworks: AbstractNetwork[]): AbstractCommitUpdate<AbstractNetwork> {
    const elementCompareResults: DefaultElementCompareHandler<AbstractNetwork> = this.createElementsUpdate(
      this.getNetworks(), newNetworks);
    return new NetworksUpdate(elementCompareResults.added, elementCompareResults.updated,
      elementCompareResults.deletedIds);
  }

  public update(newNetworks: AbstractNetwork[]) {
    const networksUpdate: NetworksUpdate = this.createElementCommitUpdate(newNetworks);
    this.lastRequestId = uuidv4();
    this.networkService.networksUpdate(networksUpdate, this.lastRequestId).subscribe(
      () => {
        // TODO notify Transport's updated?
      },
      (error) => {
        console.log('ClientNetworksModel update ERROR', error);
      }
    );
  }

  public notifyStompEvent(topic: string, messageJson: string) {
    console.log('ClientNetworksModel topic: ', topic, ', messageJson: ', messageJson);
    if (topic === StompVariables.stompChannels.notifyCommitUpdate) {
      const notifyCommitUpdate: NotifyCommitUpdate = JSON.parse(messageJson);
      const lastCommitUpdateRequestId: string = localStorage.getItem('lastCommitUpdateRequestId');
      // Refresh from other client
      if (lastCommitUpdateRequestId !== notifyCommitUpdate.requestId) {
        console.log('ClientNetworksModel refreshing from other client, notifyStompEvent: ', topic,
          ', notifyCommitUpdate: ', notifyCommitUpdate, ', lastCommitUpdateRequestId: ', lastCommitUpdateRequestId);
        this.refresh();
      } else {
        console.log('ClientNetworksModel ignoring notifyStompEvent: ', topic,
          ', notifyCommitUpdate: ', notifyCommitUpdate, ', lastCommitUpdateRequestId: ', lastCommitUpdateRequestId);
      }
    }
  }

  private addSupportedNetwork(network: AbstractNetwork): void {
    switch (network.networkType) {
      case NetworkType.ATSC_TERRESTRIAL:
        this.networkMap.set(network.id, network as TerrestrialATSCNetwork);
        break;
      case NetworkType.ATSC_CABLE:
        this.networkMap.set(network.id, network as CableATSCNetwork);
        break;
      case NetworkType.ATSC_3:
        this.networkMap.set(network.id, network as ATSC3Network);
        break;
    }
    console.log('addResolvedNetwork transport.transportType: ', network.networkType, ', network: ', network);
  }

  private doNetworksRefresh(): void {
    this.refreshNetworks();
    this.refreshNetworkServiceUuids();
  }

  private refreshNetworks(): void {
    this.networkService.getNetworks().subscribe(networks => {
      this.networkMap.clear();
      networks?.forEach(network => {
        this.addSupportedNetwork(network);
      });
      this.networkList.next(cloneDeep(Array.from(this.networkMap.values())));
      console.log('ClientNetworksModel networkMap length: ', this.networkMap.size);
    });
  }

  private refreshNetworkServiceUuids(): void {
    this.networkService.getServiceUuids().subscribe(serviceUuidDescriptors => {
      this.serviceUuidMap.clear();
      serviceUuidDescriptors?.forEach(serviceUuidDescriptor => {
        this.serviceUuidMap.set(serviceUuidDescriptor.id, serviceUuidDescriptor.uuid);
      });
      console.log('ClientNetworksModel refreshNetworkServiceUuids serviceUuidMap length: ', this.serviceUuidMap.size);
    });
  }
}
