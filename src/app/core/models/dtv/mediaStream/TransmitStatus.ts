// Copyright (c) 2023 Triveni Digital, Inc. All rights reserved.

export class TransmitStatus {
  public constructor(public representationId: string, public mimeType: string, public codecs: string,
                     public bitRate: number) {
  }
}

export class TransmitStatusSample {
  public constructor(public routeId: number, public timeStamp: number, public transmitStatusList: TransmitStatus[]) {
  }
}

export abstract class AbstractRepresentationTransmitDescriptor {
  protected constructor(public representationId: string, public mimeType: string, bitrate: number,
                        public maxBitrate: number, public maxBitrateTimestamp: number) {
  }
}

export class RouteRepresentationTransmitDescriptor extends AbstractRepresentationTransmitDescriptor {
  public constructor(public tsi: number, public representationId: string, public mimeType: string, bitrate: number,
                     public maxBitrate: number, public maxBitrateTimestamp: number) {
    super(representationId, mimeType, bitrate, maxBitrate, maxBitrateTimestamp);
  }
}

export class MMTPRepresentationTransmitDescriptor extends AbstractRepresentationTransmitDescriptor {
  public constructor(public assetID: string, public contentType: string, public tableId: number,
                     public packetId: number, public representationId: string, public mimeType: string, bitrate: number,
                     public maxBitrate: number, public maxBitrateTimestamp: number) {
    super(representationId, mimeType, bitrate, maxBitrate, maxBitrateTimestamp);
  }
}

export abstract class AbstractSegmentTransmitDescriptor {
  protected constructor(public destinationAddress: string, public destinationPort: number,
                        public outputInterface: string, public serviceId: number, public majorNumber: number,
                        public minorNumber: number, public globalServiceID: string, public shortName: string) {
  }
}

export class RouteMediaSegmentSegmentTransmitDescriptor extends AbstractSegmentTransmitDescriptor {
  public constructor(public payloadFormatId: number,
                     public routeRepresentationTransmitDescriptor: RouteRepresentationTransmitDescriptor[],
                     public destinationAddress: string, public destinationPort: number, public outputInterface: string,
                     public serviceId: number, public majorNumber: number, public minorNumber: number,
                     public globalServiceID: string, public shortName: string) {
    super(destinationAddress, destinationPort, outputInterface, serviceId, majorNumber, minorNumber, globalServiceID,
      shortName);
  }
}

export class MMTPMediaSegmentTransmitDescriptor extends AbstractSegmentTransmitDescriptor {
  public constructor(public packageId: string,
                     public mmtpRepresentationTransmitDescriptors: MMTPRepresentationTransmitDescriptor[],
                     public destinationAddress: string, public destinationPort: number, public outputInterface: string,
                     public serviceId: number, public majorNumber: number, public minorNumber: number,
                     public globalServiceID: string, public shortName: string) {
    super(destinationAddress, destinationPort, outputInterface, serviceId, majorNumber, minorNumber, globalServiceID,
      shortName);
  }
}
