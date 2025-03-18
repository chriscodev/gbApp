// Copyright (c) 2023-2025 Triveni Digital, Inc. All rights reserved.
import {Injectable} from '@angular/core';
import {AbstractElement, DisplayNameType, UNINITIALIZED_ID} from '../../../AbstractElement';
import {DescriptorElement} from './DescriptorElement';
import {AbstractChannel, ChannelType} from './Channel';
import {AbstractCommitUpdate} from '../../../CommitUpdate';
import {v4 as uuidv4} from 'uuid';
import {Observable, Subject} from 'rxjs';
import {TransportType} from '../physical/Transport';

export enum NetworkType {
  ATSC_TERRESTRIAL = 'ATSC_TERRESTRIAL',
  ATSC_CABLE = 'ATSC_CABLE',
  ATSC_MH = 'ATSC_MH',
  ATSC_3 = 'ATSC_3',
  ATSC_3_KR = 'ATSC_3_KR',
  SCTE = 'SCTE',
  DVB_SI = 'DVB_SI',
}

export const NETWORK_TYPES: Record<NetworkType, DisplayNameType> = {
  [NetworkType.ATSC_TERRESTRIAL]: {displayName: 'ATSC-Terrestrial'},
  [NetworkType.ATSC_CABLE]: {displayName: 'ATSC-Cable'},
  [NetworkType.ATSC_MH]: {displayName: 'ATSC M/H'},
  [NetworkType.ATSC_3]: {displayName: 'ATSC-3.0'},
  [NetworkType.ATSC_3_KR]: {displayName: 'ATSC-3.0 Korea'},
  [NetworkType.SCTE]: {displayName: 'SCTE-65'},
  [NetworkType.DVB_SI]: {displayName: 'DVB-SI'}
};

export type ChannelDisplayType = {
  channelTypeValue: ChannelType
  channelTransportArrayLink: TransportType[]
};

export const NETWORK_FOR_CHANNEL: Record<string, ChannelDisplayType> = {
  ['ATSC_CABLE']: {channelTypeValue: ChannelType.ATSC, channelTransportArrayLink: [TransportType.ATSC_PSIP_CABLE]},
  ['ATSC_TERRESTRIAL']: {
    channelTypeValue: ChannelType.ATSC,
    channelTransportArrayLink: [TransportType.ATSC_PSIP_TERRESTRIAL]
  },
  ['ATSC_3']: {
    channelTypeValue: ChannelType.ATSC3,
    channelTransportArrayLink: [TransportType.ATSC_3, TransportType.ATSC_3_TRANSLATED]
  },
};

export abstract class AbstractNetwork extends AbstractElement {
  protected constructor(public name: string,
                        public networkType: NetworkType,
                        public channels: AbstractChannel[],
                        public descriptorElements: DescriptorElement[], public id?: number,
                        public clientId?: string
  ) {
    super(id, clientId);
  }
}

export abstract class AbstractTerrestrialATSCNetwork extends AbstractNetwork {
  protected constructor(
    public name: string,
    public networkType: NetworkType,
    public channels: AbstractChannel[],
    public descriptorElements: DescriptorElement[],
    public id?: number,
    public clientId?: string
  ) {
    super(
      name,
      NetworkType.ATSC_TERRESTRIAL,
      channels,
      descriptorElements,
      id,
      clientId
    );
  }
}

export class Network extends AbstractNetwork {
  public constructor() {
    super('', null, undefined, undefined, undefined);
  }
}


export class TerrestrialATSCNetwork extends AbstractNetwork {
  public constructor(public name: string, public channels: AbstractChannel[],
                     public descriptorElements: DescriptorElement[], public id?: number, public clientId?: string) {
    super(name, NetworkType.ATSC_TERRESTRIAL, channels, descriptorElements, id, clientId);
  }
}

export class DefaultTerrestrialATSCNetwork extends TerrestrialATSCNetwork {
  public constructor(public name: string) {
    super('', [], [], UNINITIALIZED_ID, uuidv4());
  }
}

export class CableATSCNetwork extends AbstractNetwork {
  public constructor(public name: string, public channels: AbstractChannel[],
                     public descriptorElements: DescriptorElement[], public id?: number, public clientId?: string) {
    super(name, NetworkType.ATSC_CABLE, channels, descriptorElements, id, clientId);
  }
}

export class DefaultCableATSCNetwork extends CableATSCNetwork {
  public constructor(public name: string) {
    super('', [], [], UNINITIALIZED_ID, uuidv4());
  }
}

export class ATSC3Network extends AbstractNetwork {
  public constructor(public name: string, public channels: AbstractChannel[],
                     public descriptorElements: DescriptorElement[], public id?: number, public clientId?: string) {
    super(name, NetworkType.ATSC_3, channels, descriptorElements, id, clientId);
  }
}

export class DefaultATSC3Network extends ATSC3Network {
  public constructor(public name: string) {
    super('', [], [], UNINITIALIZED_ID, uuidv4());
  }
}


export class NetworksUpdate extends AbstractCommitUpdate<AbstractNetwork> {
  public constructor(public added: AbstractNetwork[], public updated: AbstractNetwork[], public deleted: number[]) {
    super(added, updated, deleted);
  }
}


export class NetworksChangedEvent {
  public constructor(public dirty: boolean, public newNetworks: AbstractNetwork[]) {
  }
}

// TODO FYI - Triveni thinks the below class shouldn't exist. It seems to have gotten moved from services to here.
//  For situations in which un-committed transports, networks,and/or outputs need to be accessed the DtvNetworkComponent
//  component can be injected and use local* properties. Lovina is going to look into making this change.
@Injectable({
  providedIn: 'root',
})
export class NetworkTransportLinking {
  // public transportPerNetwork: string[] = [];
  // public transportProgramPerNetwork: string[] = [];
//  public transportRecoveryPerNetwork: string[] = [];
  public majorPerNetwork: string[] = [];
  private subjectNetwork = new Subject<any>();
//  private selectedChannelLinkedTransport = 'Unlinked';
  // private selectedChannelLinkedTransportObject: AbstractTransport;

  public constructor() {
  }


  public sendDataNetworkCSV(message: []) {
    this.subjectNetwork.next(message);
  }

  public getDataNetworkCSV(): Observable<any> {
    return this.subjectNetwork.asObservable();
  }

}
