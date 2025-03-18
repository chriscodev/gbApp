/*
 * Copyright (c) 2023-2024 Triveni Digital, Inc. All rights reserved.
 */

import {AbstractElement} from '../AbstractElement';
import {ActionMessage, ButtonType} from '../ui/dynamicTable';

export enum EventLogType {
  CRITICAL = 'CRITICAL',
  ERROR = 'ERROR',
  PRIORITY = 'PRIORITY',
  WARNING = 'WARNING',
  INFORMATION = 'INFORMATION',
  VERBOSE = 'VERBOSE'
}

export interface EventLogTypeWithDisplayName {
  readonly eventLogType: EventLogType;
  readonly displayName: string;
}

export class EventLogMessage extends AbstractElement {
  public constructor(public timeStamp: string, public eventLogType: EventLogType, public sourceName: string,
                     public message: string, public thrown: string, public id?: number, public clientId?: string) {
    super(id, clientId);
  }
}

export class GetruntimeLogsDownloadZipInfo {
  successful: boolean;
  errorMessage: string;
  fileSize: string;
  downloadRelativePath: string;
  lastUpdatedTime: string;
}
export class RuntimeLogsZipInfo {
  public constructor(public successful: boolean, public errorMessage: string, public fileSize: number,
                     public downloadRelativePath: string, public lastUpdatedTime: string) {
  }
}

export class DefaultEventLogMessage extends EventLogMessage {
  public constructor() {
    super ( null, EventLogType.INFORMATION, '', '', '', null);
  }
}
export  class RuntimeLog{
  constructor(public fileName: string){}
}
