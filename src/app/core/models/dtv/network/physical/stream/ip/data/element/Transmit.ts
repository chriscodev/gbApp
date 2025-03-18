// Copyright (c) 2023 Triveni Digital, Inc. All rights reserved.

export enum FECMode {
  NONE = 'NONE', RAPTOR_Q = 'RAPTOR_Q'
}

export interface FECModeWithDisplayName {
  readonly fecMode: FECMode;
  readonly displayName: string;
}

export const FEC_MODES: FECModeWithDisplayName[] = [
  {fecMode: FECMode.NONE, displayName: 'NONE'},
  {fecMode: FECMode.RAPTOR_Q, displayName: 'Raptor Q'}
];

export enum FECDeliveryMode {
  IN_SESSION = 'IN_SESSION', OTHER_SESSION = 'OTHER_SESSION'
}

export enum TransmitPriority {
  LOW = 'LOW', MEDIUM = 'MEDIUM', HIGH = 'HIGH', URGENT = 'URGENT'
}

export class FECAttributes {
  public constructor(public fecMode: FECMode, public fecDeliveryMode: FECDeliveryMode, public maxBlockSize: number,
                     public percent: number, public maxPartitionSize: number) {
  }
}
export class DefaultFECAttributes extends FECAttributes{
  public constructor() {
    super(FECMode.NONE, null, null, null, null);
  }
}

export class TransmitAttributes {
  public constructor(public transmitPriority: TransmitPriority, public startTime: string, public endTime: string,
                     public intervalInSeconds: number, public bitratePercent: number, public count: number,
                     public fecAttributes: FECAttributes) {
  }
}

export class DefaultTransmitAttributes extends TransmitAttributes{
  public constructor() {
    super(TransmitPriority.LOW, null, null, null, null, null, new DefaultFECAttributes());
  }
}
