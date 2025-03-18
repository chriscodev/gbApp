/*
 * Copyright (c) 2023-2024 Triveni Digital, Inc. All rights reserved.
 */

import {AbstractElement} from '../../../../../../AbstractElement';
import {DataElement} from './element/DataElement';
import {AbstractCommitUpdate} from '../../../../../../CommitUpdate';

export enum DeliveryMode {
  BROADCAST = 'BROADCAST', BROADBAND = 'BROADBAND', BOTH = 'BOTH'
}

export enum PackageType {
  ATSC3_APP_NRT = 'ATSC3_APP_NRT', USER_DEFINED_NDP = 'USER_DEFINED_NDP'
}

export interface PackageTypeWithDisplayName {
  readonly packageType: PackageType;
  readonly displayName: string;
}

export const PACKAGE_TYPES: PackageTypeWithDisplayName[] = [
  {packageType: PackageType.ATSC3_APP_NRT, displayName: 'ATSC3 APP/NRT'},
  {packageType: PackageType.USER_DEFINED_NDP, displayName: 'NDP (Non-realtime Data Package)'}
];

export enum ElementSchedulingMode {
  RATE = 'RATE', INTERVAL = 'INTERVAL'
}

export enum TransmitMultiplexMode {
  SERIES = 'SERIES', PARALLEL = 'PARALLEL'
}

export class BroadcastAttributes {
  public constructor(public dstAddress: string, public dstPort: number, public maxTransmitBitsPerSecond: number,
                     public elementSchedulingMode: ElementSchedulingMode,
                     public transmitMultiplexMode: TransmitMultiplexMode, public mpeEnabled: boolean,
                     public atsc1OutputId: number,
                     public clientAtsc1OutputId: string, public dataPid: number) {
  }
}
export class DefaultBroadcastAttributes extends BroadcastAttributes{
  public constructor() {
    super(null, null, null, ElementSchedulingMode.RATE, TransmitMultiplexMode.SERIES,
      false, 0, '', 0);
  }
}


export class DataPackage extends AbstractElement {
 public constructor(public name: string, public transportId: number, public clientTransportId: string,
                    public serviceGroupId: number, public clientServiceGroupId: number,
                    public serviceIds: number[], public clientServiceIds: string[], public globalServiceIdList: string[],
                    public allServicesEnabled: boolean, public enabled: boolean, public packageType: PackageType,
                    public deliveryMode: DeliveryMode, public broadcastAttributes: BroadcastAttributes,
                    public dataElements: DataElement[], public id?: number,
                    public clientId?: string) {
    super(id, clientId);
  }
}

export class DataPackagesUpdate extends AbstractCommitUpdate<DataPackage> {
  public constructor(public added: DataPackage[], public updated: DataPackage[], public deleted: number[]) {
    super(added, updated, deleted);
  }
}
export class DefaultDataPackage extends DataPackage {
  public constructor() {
    super(null, null, null, 0, null, [], null, null, false, false, PackageType.ATSC3_APP_NRT, DeliveryMode.BROADCAST, null, [], -1, undefined);
  }
}

