// Copyright (c) 2023-2024 Triveni Digital, Inc. All rights reserved.

import {AbstractElement, DisplayNameType, UNINITIALIZED_ID} from '../../../AbstractElement';
import {Program} from './stream/mpeg/Program';
import {BaseServiceGroup, ServiceGroup} from './stream/ip/service-group/ServiceGroup';
import {AbstractCommitUpdate} from '../../../CommitUpdate';
import {ResolvedATSC3Service} from '../logical/Service';
import {DataPackage} from './stream/ip/data/DataPackage';
import {AbstractExtension} from '../Extension';
import {v4 as uuidv4} from 'uuid';

export enum TransportType {
  ATSC_PSIP_TERRESTRIAL = 'ATSC_PSIP_TERRESTRIAL',
  ATSC_PSIP_CABLE = 'ATSC_PSIP_CABLE',
  ATSC_3 = 'ATSC_3',
  ATSC_3_TRANSLATED = 'ATSC_3_TRANSLATED'
}

export const TRANSPORT_TYPES: Record<TransportType, DisplayNameType> = {
  [TransportType.ATSC_PSIP_TERRESTRIAL]: {displayName: 'PSIP-Terrestrial'},
  [TransportType.ATSC_PSIP_CABLE]: {displayName: 'PSIP-Cable'},
  [TransportType.ATSC_3]: {displayName: 'ATSC-3.0'},
  [TransportType.ATSC_3_TRANSLATED]: {displayName: 'ATSC-3.0 Translated'}
};

export function getTransportTypeDisplayName(transportType: TransportType): string {
  return TRANSPORT_TYPES[transportType]?.displayName || transportType.toString();
}

export abstract class AbstractTransport extends AbstractElement {
  protected constructor(
    public transportType: TransportType, public tsid: number, public name: string,
    public extensions?: AbstractExtension[], public id?: number, public clientId?: string,
  ) {
    super(id, clientId);
  }
}

export abstract class AbstractMPEGTransport extends AbstractTransport {
  protected constructor(
    public psiEnabled: boolean, public patInterval: number, public pmtInterval: number, public catInterval: number,
    public programs: Program[], public transportType: TransportType, public tsid: number, public name: string,
    public extensions: AbstractExtension[], public id?: number, public clientId?: string
  ) {
    super(transportType, tsid, name, extensions, id, clientId);
  }
}

export abstract class AbstractPSIPTransport extends AbstractMPEGTransport {
  protected constructor(
    public rrtEnabled: boolean,
    public ettEnabled: boolean,
    public encodeHiddenServices: boolean,
    public eitStartPid: number,
    public psiEnabled: boolean,
    public eitCount: number,
    public ettStartPid: number,
    public channelEttPid: number,
    public vctInterval: number,
    public mgtInterval: number,
    public rrtInterval: number,
    public eitInterval: number,
    public eitKModifier: number,
    public ettInterval: number,
    public ettKModifier: number,
    public ratingRegion: number,
    public sttInterval: number,
    public patInterval: number,
    public pmtInterval: number,
    public catInterval: number,
    public programs: Program[],
    public transportType: TransportType,
    public tsid: number,
    public name: string,
    public extensions: AbstractExtension[],
    public id?: number,
    public clientId?: string
  ) {
    super(
      psiEnabled,
      patInterval,
      pmtInterval,
      catInterval,
      programs,
      transportType,
      tsid,
      name,
      extensions,
      id,
      clientId
    );
  }
}


/** Concrete Transports */
export class TerrestialPSIPTransport extends AbstractMPEGTransport {
  public constructor(
    public rrtEnabled: boolean,
    public ettEnabled: boolean,
    public encodeHiddenServices: boolean,
    public eitStartPid: number,
    public psiEnabled: boolean,
    public eitCount: number,
    public ettStartPid: number,
    public channelEttPid: number,
    public vctInterval: number,
    public mgtInterval: number,
    public rrtInterval: number,
    public eitInterval: number,
    public eitKModifier: number,
    public ettInterval: number,
    public ettKModifier: number,
    public ratingRegion: number,
    public sttInterval: number,
    public patInterval: number,
    public pmtInterval: number,
    public catInterval: number,
    public programs: Program[],
    public tsid: number,
    public name: string,
    public extensions: AbstractExtension[],
    public id?: number,
    public clientId?: string
  ) {
    super(
      psiEnabled,
      patInterval,
      pmtInterval,
      catInterval,
      programs,
      TransportType.ATSC_PSIP_TERRESTRIAL,
      tsid,
      name,
      extensions,
      id,
      clientId
    );
  }
}

export class DefaultTerrestialPSIPTransport extends TerrestialPSIPTransport {
  public constructor(public tsid: number, public name: string) {
    super(false, true, true, 7424, false, 4, 7680, 7808, 400, 150, 6000, 500, 1000, 500, 1000, 1, 1000, 100, 400,
      1000, [], tsid, name, [], UNINITIALIZED_ID, uuidv4());
  }
}

export class CablePSIPTransport extends AbstractMPEGTransport {
  public constructor(
    public rrtEnabled: boolean,
    public ettEnabled: boolean,
    public encodeHiddenServices: boolean,
    public eitStartPid: number,
    public psiEnabled: boolean,
    public eitCount: number,
    public ettStartPid: number,
    public channelEttPid: number,
    public vctInterval: number,
    public mgtInterval: number,
    public rrtInterval: number,
    public eitInterval: number,
    public eitKModifier: number,
    public ettInterval: number,
    public ettKModifier: number,
    public ratingRegion: number,
    public sttInterval: number,
    public patInterval: number,
    public pmtInterval: number,
    public catInterval: number,
    public programs: Program[],
    public tsid: number,
    public name: string,
    public extensions: AbstractExtension[],
    public id?: number,
    public clientId?: string
  ) {
    super(
      psiEnabled, patInterval, pmtInterval, catInterval, programs, TransportType.ATSC_PSIP_CABLE,
      tsid, name, extensions, id, clientId
    );
  }
}

export class DefaultCablePSIPTransport extends CablePSIPTransport {
  public constructor(public tsid: number, public name: string) {
    super(false, true, true, 7424, false, 4, 7680, 7808, 400, 150, 6000, 500, 1000, 500, 1000, 1, 1000, 100, 400,
      1000, [], tsid, name, [], UNINITIALIZED_ID, uuidv4());
  }
}

export class ATSC3Transport extends AbstractTransport {
  public constructor(public serviceGroups: ServiceGroup[], public tsid: number, public name: string,
                     public extensions: AbstractExtension[], public id?: number, public clientId?: string
  ) {
    super(TransportType.ATSC_3, tsid, name, extensions, id, clientId);
  }
}

export class DefaultATSC3Transport extends ATSC3Transport {
  public constructor(public tsid: number, public name: string) {
    super([], tsid, name, [], UNINITIALIZED_ID, uuidv4());
  }
}

export class ATSC3TranslatorTarget extends AbstractElement {
  protected constructor(public id: number, public transportId: number, public targetId: string,
                        public clientId: string) {
    super(id);
  }
}

export class ATSC3TranslatedTransport extends AbstractTransport {
  protected constructor(public tsid: number, public name: string, public extensions: AbstractExtension[],
                        public originalTransportId: number, public targets: ATSC3TranslatorTarget[],
                        public originalClientTransportId?: string, public id?: number, public clientId?: string) {
    super(TransportType.ATSC_3_TRANSLATED, tsid, name, extensions, id, clientId);
  }
}

export class DefaultATSC3TranslatedTransport extends ATSC3TranslatedTransport {
  public constructor(public tsid: number, public name: string) {
    super(tsid, name, [], UNINITIALIZED_ID, [], uuidv4(), UNINITIALIZED_ID, uuidv4());
  }
}

export class DefaultATSC3TranslatorTarget extends ATSC3TranslatorTarget {
  public constructor() {
    super(UNINITIALIZED_ID, UNINITIALIZED_ID, null, uuidv4());
  }
}


export class ResolvedATSC3Transport extends AbstractTransport {
  public constructor(
    public serviceGroups: BaseServiceGroup[],
    public services: ResolvedATSC3Service[],
    public mediaStreams: MediaStream[],
    public dataPackages: DataPackage[],
    public tsid: number,
    public name: string,
    public extensions: AbstractExtension[],
    public id?: number,
    public clientId?: string
  ) {
    super(TransportType.ATSC_3, tsid, name, extensions, id, clientId);
  }
}

export class TransportsUpdate extends AbstractCommitUpdate<AbstractTransport> {
  public constructor(
    public added: AbstractTransport[],
    public updated: AbstractTransport[],
    public deleted: number[]
  ) {
    super(added, updated, deleted);
  }
}

export class TransportsChangedEvent {
  public constructor(public dirty: boolean, public newTransports: AbstractTransport[]) {
  }
}

export class TranslatedRoute {
  public constructor(public id: number, public clientId: string, public transportName: string,
                     public transportId: number, public clientTransportId: string) {
  }
}
