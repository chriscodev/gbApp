// Copyright (c) 2023 Triveni Digital, Inc. All rights reserved.

export enum StreamLogType {
  MEDIA_STREAM = 'MEDIA_STREAM', DATA_STREAM = 'DATA_STREAM'
}

export enum StreamLogLevel {
  SEVERE = 'SEVERE', ERROR = 'ERROR', WARNING = 'WARNING', INFORMATION = 'INFORMATION'
}

export class StreamLogEntry {
  public constructor(public id: number, public routeId: number, public type: StreamLogType, public date: string,
                     public message: string, public logType: StreamLogType) {
  }
}
