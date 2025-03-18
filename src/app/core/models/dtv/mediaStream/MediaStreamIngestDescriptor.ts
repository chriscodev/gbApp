// Copyright (c) 2023 Triveni Digital, Inc. All rights reserved.

export class ArrivalHistoryDescriptor {
  public constructor(public downloadStartTime: number, public downloadCompleteTime: number, public segmentSize: number,
                     public segmentDurationMillis: number) {
  }
}

export class MediaSegmentIngestDescriptor {
  public constructor(public representationId: string, public mimeType: string, public codecs: string,
                     public segmentNumber: number, public ingestURL: string, public segmentName: number,
                     public ingestBitrate: number, public maxSize: number, public maxSizeTimestamp: number,
                     public maxDurationMillis: number, public maxDurationMillisTimestamp: number,
                     public arrivalHistoryDescriptors: ArrivalHistoryDescriptor[]) {
  }
}

export class MediaStreamIngestDescriptor {
  public constructor(public mediaSegments: MediaSegmentIngestDescriptor[]) {
  }
}
