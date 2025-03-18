/*
 * Copyright (c) 2023-2024 Triveni Digital, Inc. All rights reserved.
 */

import {AbstractTransport} from '../network/physical/Transport';
import {ProcessableElementState} from '../common/ProcessableElementState';
import {TableDomain} from './Output';

export class TableStatus {
  public constructor(public tableDomain: TableDomain, public name: string, public tableTypeId: number,
                     public version: number, public size: number, public transmitPriority: number,
                     public intervalInMillis: number, public pid: number, public lastEncoded: Date,
                     public filterName: string) {
  }
}

export class TransportStatus {
  public constructor(public lastEncodeStartTime: Date,
                     public lastEncodeEndTime: Date,
                     public tablesStatus: TableStatus[], public transport: AbstractTransport) {
  }
}

export class PIDBitrateSample {
  public constructor(public sampleTimeStamp: string, public pidBitrates: PIDBitrate[]) {
  }
}

export class PIDBitrate {
  public constructor(public pid: number, public rateMbps: number) {
  }
}

export class PIDGroupBitrate {
  public constructor(public pidGroupName: string, public rateMbps: number) {
  }
}

export class PIDGroupBitrateSample {
  public constructor(public sampleTimeStamp: string, public pidGroupBitrates: PIDGroupBitrate[]) {
  }
}

/**
 * Used for ATSC1 UDP and ASI Outputs
 */
export class StreamedTransportStatus extends TransportStatus {
  public constructor(
    public faulted: boolean, public faultMessage: string,
    public bitrateMbps: number,
    public pidBitrateSamples: PIDBitrateSample[],
    public pidGroupBitrateSamples: PIDGroupBitrateSample[], public lastEncodeStartTime: Date,
    public lastEncodeEndTime: Date, public tablesStatus: TableStatus[], public transport: AbstractTransport) {
    super(lastEncodeStartTime, lastEncodeEndTime, tablesStatus, transport);
  }
}

export class OutputStatus {
  public constructor(public outputId: number, public lastEncodedStartTime: Date, public lastEncodedEndTime: Date,
                     public lastOutputUpdateStartTime: Date, public lastOutputUpdateEndTime: Date,
                     public outputState: ProcessableElementState, public lastUpdateTime: Date,
                     public lastUpdateMessage: string, public transportsStatus: TransportStatus[]) {
  }
}

export class ASIOutputStatus {
  public constructor(public bitrateMbps: number) {
  }
}

export class UDPOutputStatus {
  public constructor(public bitrateMbps: number) {
  }
}

export class ServiceGroupStatistics {
  public constructor(public id: number, public groupId: number,
                     public bytesTransmitted: number, public bytesQueued: number, public oldestPacketAge: number,
                     public formattedSummary: string) {
  }
}

export class ATSC3UDPOutputStatus {
  public constructor(public srcAddress: string, public srcPort: number,
                     public serviceGroupStatistics: ServiceGroupStatistics[]) {
  }
}
