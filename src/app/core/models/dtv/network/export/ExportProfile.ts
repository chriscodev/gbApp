/*
 * Copyright (c) 2023-2024 Triveni Digital, Inc. All rights reserved.
 */
import {v4 as uuidv4} from 'uuid';
import {AbstractElement, DisplayNameType, UNINITIALIZED_ID} from '../../../AbstractElement';
import {AbstractCommitUpdate} from '../../../CommitUpdate';

export enum ExportType {
  TCP = 'TCP', FTP = 'FTP', STREAMSCOPE = 'STREAMSCOPE'
}

export enum ExportState {
  OFFLINE = 'Offline', ONLINE = 'Online', PENDING = 'Pending', PROCESSING = 'Processing',
  ERROR = 'Error', COMPLETE = 'Complete'
}

export enum ExportFrequency {
  AUTOMATIC = 'AUTOMATIC', DAILY = 'DAILY', INTERVAL = 'INTERVAL', ON_DEMAND = 'ON_DEMAND'
}

export const EXPORT_TYPES: Record<ExportType, DisplayNameType> = {
  [ExportType.TCP]: {displayName: 'TCP'},
  [ExportType.FTP]: {displayName: 'FTP'},
  [ExportType.STREAMSCOPE]: {displayName: 'StreamScope'},
};
export const EXPORT_FREQUENCY_TYPES: Record<ExportFrequency, DisplayNameType> = {
  [ExportFrequency.AUTOMATIC]: {displayName: 'Automatic'},
  [ExportFrequency.DAILY]: {displayName: 'Daily'},
  [ExportFrequency.INTERVAL]: {displayName: 'Interval'},
  [ExportFrequency.ON_DEMAND]: {displayName: 'On Demand'},
};

export class ExportStatus extends AbstractElement {
  public constructor(public id: number, public scheduleProfileId: number, public exportState: ExportState,
                     public lastExportMessage: string, public lastExportTime?: Date) {
    super(id);
  }
}

export class ServiceExportLinks extends AbstractElement {
  public constructor(public exportId: number, public serviceId: number, public id?: number, public clientId?: string) {
    super(id, clientId);
  }
}

export class DefaultExportStatus extends ExportStatus {
  public constructor() {
    super(-1, null, ExportState.OFFLINE, null, null);
  }
}

export class DefaultServiceExportLinks extends ServiceExportLinks {
  public constructor() {
    super(undefined, undefined, UNINITIALIZED_ID, uuidv4());
  }
}

export abstract class ExportProfile extends AbstractElement {
  public constructor(public name: string, public type: ExportType, public onLine: boolean,
                     public XSLT: string, public numberOfDaysToExport: number, public exportFrequency: ExportFrequency, public initialTime: string,
                     public intervalInMinutes: number, public lastCompletion: Date, public serviceLinks: ServiceExportLinks[],
                     public id?: number, public clientId?: string) {
    super(id, clientId);
  }
}

export class FTPExportProfile extends ExportProfile {
  public constructor(public name: string, public type: ExportType, public onLine: boolean, public XSLT: string, public numberOfDaysToExport: number,
                     public exportFrequency: ExportFrequency, public initialTime: string, public intervalInMinutes: number,
                     public lastCompletion: Date, public serviceLinks: ServiceExportLinks[], public user: string, public password: string,
                     public port: number, public path: string, public fileName: string, public host: string, public id?: number, public clientId?: string) {
    super(name, ExportType.FTP, onLine, XSLT, numberOfDaysToExport, exportFrequency, null, intervalInMinutes,
      null, [], id, clientId);
  }
}

export class DefaultFTPExportProfile extends FTPExportProfile {
  public constructor(public name: string, public onLine: boolean) {
    super(name, ExportType.FTP, onLine, null, 1, ExportFrequency.AUTOMATIC, null,
      60, null, [], null, null, undefined,
      null, null, null, UNINITIALIZED_ID, uuidv4());
  }
}

export class TCPExportProfile extends ExportProfile {
  public constructor(public name: string, public type: ExportType, public onLine: boolean, public XSLT: string, public numberOfDaysToExport: number,
                     public exportFrequency: ExportFrequency, public initialTime: string, public intervalInMinutes: number,
                     public lastCompletion: Date, public serviceLinks: ServiceExportLinks[], public address: string,
                     public port: number, public id?: number, public clientId?: string) {
    super(name, ExportType.TCP, onLine, XSLT, numberOfDaysToExport, exportFrequency, null, intervalInMinutes,
      null, [], id, clientId);
  }
}

export class StreamScopeExportProfile extends ExportProfile {
  public constructor(public name: string, public type: ExportType, public onLine: boolean, public XSLT: string, public numberOfDaysToExport: number,
                     public exportFrequency: ExportFrequency, public initialTime: string, public intervalInMinutes: number,
                     public lastCompletion: Date, public serviceLinks: ServiceExportLinks[], public url: string,
                     public id?: number, public clientId?: string) {
    super(name, ExportType.STREAMSCOPE, onLine, XSLT, numberOfDaysToExport, exportFrequency, null, intervalInMinutes,
      null, [], id, clientId);
  }
}

export class DefaultTCPExportProfile extends TCPExportProfile {
  public constructor(public name: string, public onLine: boolean) {
    super(name, ExportType.TCP, onLine, null, 1, ExportFrequency.AUTOMATIC, null,
      60, null, [], null, undefined, UNINITIALIZED_ID, uuidv4());
  }
}


export class DefaultStreamScopeExportProfile extends StreamScopeExportProfile {
  public constructor(public name: string, public onLine: boolean) {
    super(null, ExportType.STREAMSCOPE, false, null, 1, ExportFrequency.AUTOMATIC, null,
      60, null, [], null, UNINITIALIZED_ID, uuidv4());
  }
}

export class ServiceExportProfileUpdate extends AbstractCommitUpdate<ExportProfile> {
  constructor(public added: ExportProfile[], public updated: ExportProfile[], public deleted: number[]) {
    super(added, updated, deleted);
  }
}

export function isExportTypeFTPSettingsBased(exportType: ExportType): boolean {
  return exportType === ExportType.FTP;
}

export function isExportTypeTCPSettingsBased(exportType: ExportType): boolean {
  return exportType === ExportType.TCP;
}

export function isExportTypeStreamScopeSettingsBased(exportType: ExportType): boolean {
  return exportType === ExportType.STREAMSCOPE;
}

export class TranslatedExportStatus {
  public constructor(public id: number, public serviceProfileId: number, public lastUpdateTime: Date) {
  }
}

export class TranslatedServiceLinks {
  // id here is serviceId
  public constructor(public id: number, public majorMinorNumber: string, public serviceName: string, public channelName: string,
                     public networkName: string, public clientId?: string) {
  }
}


export class DefaultTranslatedServiceData extends TranslatedServiceLinks {
  public constructor(public exportId: number) {
    super(exportId, undefined, null, null, null, uuidv4());
  }
}

export class ExportProfileChangedEvent {
  public constructor(public dirty: boolean, public newExportProfiles: ExportProfile[]) {
  }
}

export class FileDescriptor {
  public constructor(public fileName: string, public fileSize: number, public lastModified: string) {
  }
}

export class FTPTestRequest {
  public constructor(public host: string, public port: number, public path: string,
                     public username: string, public password: string) {
  }
}

export function getFTPRequestObject(serviceExportProfile: FTPExportProfile): FTPTestRequest {
  return new FTPTestRequest(serviceExportProfile.host, serviceExportProfile.port,
    serviceExportProfile.path, serviceExportProfile.user, serviceExportProfile.password);
}

export class FTPTestResponse {
  public constructor(public requestId: number, public successful: boolean, public errorMessage: string,
                     public ftpFiles: FileDescriptor[]) {
  }
}

