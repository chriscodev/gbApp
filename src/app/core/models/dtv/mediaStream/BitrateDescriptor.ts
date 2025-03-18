// Copyright (c) 2023 Triveni Digital, Inc. All rights reserved.

export class BitrateDescriptor {
  public constructor(public streamId: number, public streamName: string, public streamCurrentTransmitBPS: number) {
  }
}
