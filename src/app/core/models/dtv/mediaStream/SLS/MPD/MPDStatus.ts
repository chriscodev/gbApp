// Copyright (c) 2023 Triveni Digital, Inc. All rights reserved.

export enum MPDStatusType {
  DOWNLOAD_COMPLETE = 'DOWNLOAD_COMPLETE',
  DOWNLOAD_FAILED = 'DOWNLOAD_FAILED',
  DOWNLOAD_NOT_MODIFIED = 'DOWNLOAD_NOT_MODIFIED',
  PARSE_ERROR = 'PARSE_ERROR'
}

export interface MPDStatusTypeWithDisplayName {
  readonly type: MPDStatusType;
  readonly displayName: string;
}

export const MPDStatusTypes: MPDStatusTypeWithDisplayName[] = [{
  type: MPDStatusType.DOWNLOAD_COMPLETE,
  displayName: 'Download Complete'
}, {type: MPDStatusType.DOWNLOAD_FAILED, displayName: 'Download Failed'}, {
  type: MPDStatusType.DOWNLOAD_NOT_MODIFIED,
  displayName: 'Download Not Modified'
}, {type: MPDStatusType.PARSE_ERROR, displayName: 'Parsing Error'}];

export class RepresentationDescriptor {
  public constructor(public id: string, public mimeType: string, public bandwidth: number) {
  }
}

export class MPDStatus {
  public constructor(public routeId, public type: MPDStatusType, public mpdPath: string, public mpdFileName: string,
                     public lastDownloadTime: number, public lastVerificationTime: number, public nextVerificationTime,
                     public status: string, public representationDescriptors: RepresentationDescriptor[]) {
  }
}
